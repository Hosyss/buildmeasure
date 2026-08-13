import http from "node:http";
import { createGzip } from "node:zlib";

const upstreamHost = "127.0.0.1";
const upstreamPort = Number(process.env.UPSTREAM_PORT || 4173);
const listenPort = Number(process.env.PORT || 4174);

function isCompressible(contentType = "") {
  return /^(?:text\/|application\/(?:javascript|json|xml)|image\/svg\+xml)/i.test(contentType);
}

const server = http.createServer((request, response) => {
  const upstream = http.request(
    {
      host: upstreamHost,
      port: upstreamPort,
      method: request.method,
      path: request.url,
      headers: request.headers,
    },
    (upstreamResponse) => {
      const headers = { ...upstreamResponse.headers };
      const acceptsGzip = /(?:^|,)\s*gzip\s*(?:,|$)/i.test(request.headers["accept-encoding"] || "");
      const alreadyEncoded = Boolean(headers["content-encoding"]);
      const compress = acceptsGzip && !alreadyEncoded && isCompressible(headers["content-type"] || "");

      if (!compress) {
        response.writeHead(upstreamResponse.statusCode || 502, headers);
        upstreamResponse.pipe(response);
        return;
      }

      delete headers["content-length"];
      headers["content-encoding"] = "gzip";
      headers.vary = headers.vary ? `${headers.vary}, Accept-Encoding` : "Accept-Encoding";
      response.writeHead(upstreamResponse.statusCode || 502, headers);
      upstreamResponse.pipe(createGzip({ level: 6 })).pipe(response);
    },
  );

  upstream.on("error", (error) => {
    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    response.end(`QA proxy upstream error: ${error.message}`);
  });

  request.pipe(upstream);
});

server.listen(listenPort, "127.0.0.1", () => {
  console.log(`QA gzip proxy listening on http://127.0.0.1:${listenPort}`);
});
