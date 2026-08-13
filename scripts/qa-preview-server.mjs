import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const projectRoot = process.cwd();
const clientRoot = path.join(projectRoot, "dist", "client");
const workerPath = path.join(projectRoot, "dist", "server", "index.js");
const host = "127.0.0.1";
const port = 4173;
const mimeTypes = new Map([[".css","text/css; charset=utf-8"],[".html","text/html; charset=utf-8"],[".ico","image/x-icon"],[".jpeg","image/jpeg"],[".jpg","image/jpeg"],[".js","text/javascript; charset=utf-8"],[".json","application/json; charset=utf-8"],[".png","image/png"],[".svg","image/svg+xml"],[".txt","text/plain; charset=utf-8"],[".webp","image/webp"],[".woff","font/woff"],[".woff2","font/woff2"]]);

const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("qa-preview", `${process.pid}-${Date.now()}`);
const worker = (await import(workerUrl.href)).default;
if (!worker || typeof worker.fetch !== "function") throw new Error("Expected dist/server/index.js default.fetch");

async function assetResponse(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  if (pathname.includes("..")) return null;
  const filePath = path.join(clientRoot, pathname.replace(/^\/+/, ""));
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return null;
    return new Response(await readFile(filePath), { status: 200, headers: { "content-type": mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream" } });
  } catch { return null; }
}

async function workerResponse(request) {
  const origin = `http://${host}:${port}`;
  const url = new URL(request.url ?? "/", origin);
  const asset = await assetResponse(url.href);
  if (asset) return asset;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const init = { method: request.method, headers: request.headers };
  if (!["GET","HEAD"].includes(request.method) && body) { init.body = body; init.duplex = "half"; }
  return worker.fetch(new Request(url.href, init), { ASSETS: { fetch: async (input) => (await assetResponse(typeof input === "string" ? input : input.url)) ?? new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

function compressible(type) {
  const value = (type ?? "").toLowerCase();
  return value.startsWith("text/") || value.includes("javascript") || value.includes("json") || value.includes("xml") || value.includes("svg");
}

http.createServer(async (request, response) => {
  try {
    const result = await workerResponse(request);
    response.statusCode = result.status;
    for (const [name, value] of result.headers) {
      if (["content-encoding","content-length"].includes(name.toLowerCase())) continue;
      response.setHeader(name, value);
    }
    if (request.method === "HEAD") return response.end();
    let body = Buffer.from(await result.arrayBuffer());
    if (/gzip/i.test(request.headers["accept-encoding"] ?? "") && body.length > 1024 && compressible(result.headers.get("content-type"))) {
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
}).listen(port, host, () => console.log(`BuildMeasure QA preview listening at http://${host}:${port}`));
