/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

/**
 * Keep route hydration loading early without letting it compete with the
 * render-blocking stylesheet. The generated app shell marks every client
 * bundle as a high-priority module preload by default; these routes render
 * useful HTML before hydration, so a low fetch priority is the better tradeoff.
 */
async function prepareHtmlResponse(response: Response): Promise<Response> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.body || !contentType.includes("text/html")) {
    return applySecurityHeaders(response);
  }

  const html = (await response.text()).replace(
    /<link(?=[^>]*\brel=["']modulepreload["'])/gi,
    '<link fetchpriority="low"',
  );
  const inlineScriptHashes = new Set<string>();
  const inlineScriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(inlineScriptPattern)) {
    const attributes = match[1] ?? "";
    const script = match[2] ?? "";

    if (/\bsrc\s*=/i.test(attributes) || script.length === 0) continue;

    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(script),
    );
    const encodedDigest = btoa(
      String.fromCharCode(...new Uint8Array(digest)),
    );
    inlineScriptHashes.add(`'sha256-${encodedDigest}'`);
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return applySecurityHeaders(new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  }), inlineScriptHashes);
}

function applySecurityHeaders(
  response: Response,
  inlineScriptHashes: ReadonlySet<string> = new Set(),
): Response {
  const headers = new Headers(response.headers);
  const scriptSources = ["'self'", ...inlineScriptHashes].join(" ");
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      `script-src ${scriptSources}`,
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://buildmeasure.hosys.chatgpt.site",
      "font-src 'self'",
      "connect-src 'self'",
    ].join("; "),
  );
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set("X-Frame-Options", "SAMEORIGIN");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageResponse = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return applySecurityHeaders(imageResponse);
    }

    const response = await handler.fetch(request, env, ctx);
    return prepareHtmlResponse(response);
  },
};

export default worker;
