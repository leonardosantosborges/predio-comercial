import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { cwd } from "node:process";

const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";
const root = cwd();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

function resolveFile(urlPath) {
  const pathname = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
  const filePath = normalize(join(root, pathname));

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${host}:${port}`);
  const filePath = resolveFile(url.pathname);

  if (!filePath) {
    response.writeHead(403);
    response.end("Acesso negado");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
    });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Arquivo não encontrado");
  }
});

server.listen(port, host, () => {
  console.log(`Guia do prédio em http://${host}:${port}`);
});
