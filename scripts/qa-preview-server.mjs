import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const projectRoot = process.cwd();
const clientRoot = path.join(projectRoot, "dist", "client");
const workerPath = path.join(projectRoot, "dist", "server", "index.js");
const host = process.env.QA_PREVIEW_HOST ?? "127.0.0.1";
const port = Number(process.env.QA_PREVIEW_PORT ?? "4173");

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("qa-preview", `${process.pid}-${Date.now()}`);
const worker = (await import(workerUrl.href)).default;

if (!worker || typeof worker.fetch !== "function") {
  throw new Error("Expected dist/server/index.js to export default.fetch");
}

async function assetResponse(url) {
  const parsed = new URL(url);
  const pathname = decodeURIComponent(parsed.pathname);
  if (pathname.includes("..")) return null;
  const filePath = path.join(clientRoot, pathname.replace(/^\/+/, ""));

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return null;
    const body = await readFile(filePath);
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream",
      },
    });
  } catch {
    return null;
  }
}

async function workerResponse(request) {
  const origin = `http://${host}:${port}`;
  const requestUrl = new URL(request.url ?? "/", origin);
  const directAsset = await assetResponse(requestUrl.href);
  if (directAsset) return directAsset;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
  const init = { method: request.method, headers: request.headers };
  if (!["GET", "HEAD"].includes(request.method) && body) {
    init.body = body;
    init.duplex = "half";
  }

  const fetchRequest = new Request(requestUrl.href, init);
  const env = {
    ASSETS: {
      fetch: async (input) => {
        const target = typeof input === "string" ? input : input.url;
        return (await assetResponse(target)) ?? new Response("Not found", { status: 404 });
      },
    },
  };
  return worker.fetch(fetchRequest, env, {
    waitUntil() {},
    passThroughOnException() {},
  });
}

function isCompressible(contentType) {
  const normalized = (contentType ?? "").toLowerCase();
  return (
    normalized.startsWith("text/") ||
    normalized.includes("javascript") ||
    normalized.includes("json") ||
    normalized.includes("xml") ||
    normalized.includes("svg")
  );
}

const server = http.createServer(async (request, response) => {
  try {
    const result = await workerResponse(request);
    response.statusCode = result.status;
    for (const [name, value] of result.headers) {
      const normalizedName = name.toLowerCase();
      if (normalizedName === "content-encoding" || normalizedName === "content-length") continue;
      response.setHeader(name, value);
    }
    if (request.method === "HEAD") {
      response.end();
      return;
    }

    let body = Buffer.from(await result.arrayBuffer());
    const acceptsGzip = /(?:^|,|\s)gzip(?:,|\s|$)/i.test(request.headers["accept-encoding"] ?? "");
    const contentType = result.headers.get("content-type");
    if (acceptsGzip && body.length > 1024 && isCompressible(contentType)) {
      body = gzipSync(body, { level: 6 });
      response.setHeader("content-encoding", "gzip");
      response.setHeader("vary", "Accept-Encoding");
    }
    response.end(body);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("QA preview server error");
  }
});

server.listen(port, host, () => {
  console.log(`BuildMeasure QA preview listening at http://${host}:${port}`);
});
