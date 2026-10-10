import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../docs/", import.meta.url)));
const prefix = "/frontier-transformation-engineer";
const port = Number(process.env.PORT || 4178);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname === "/" || url.pathname === prefix) {
    response
      .writeHead(302, { location: `${prefix}/${url.search}${url.hash}` })
      .end();
    return;
  }
  try {
    if (!url.pathname.startsWith(`${prefix}/`)) {
      response.writeHead(404).end("Not found");
      return;
    }
    const relative =
      decodeURIComponent(url.pathname.slice(prefix.length + 1)) || "index.html";
    const parts = relative.split("/");
    const filePath = resolve(root, ...parts);
    if (
      parts.some((part) => part.startsWith(".")) ||
      !filePath.startsWith(`${root}${sep}`)
    ) {
      response
        .writeHead(404, { "content-type": "text/html; charset=utf-8" })
        .end(await readFile(resolve(root, "404.html")));
      return;
    }
    let path = filePath;
    const info = await stat(path);
    if (info.isDirectory()) {
      if (!url.pathname.endsWith("/")) {
        response
          .writeHead(302, { location: `${url.pathname}/${url.search}` })
          .end();
        return;
      }
      path = resolve(path, "index.html");
    }
    const content = await readFile(path);
    response
      .writeHead(200, {
        "content-type": types[extname(path)] || "application/octet-stream",
        "cache-control": "no-store",
      })
      .end(content);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      response
        .writeHead(404, { "content-type": "text/html; charset=utf-8" })
        .end(await readFile(resolve(root, "404.html")));
      return;
    }
    if (error instanceof URIError) {
      response.writeHead(400).end("Invalid path");
      return;
    }
    console.error("Erro ao servir o site:", error);
    response.writeHead(500).end("Server error");
  }
});
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Portal: http://127.0.0.1:${port}${prefix}/`);
});
