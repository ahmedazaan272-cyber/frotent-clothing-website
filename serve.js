const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 8000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const filePath = path.join(root, urlPath === "/" ? "index.html" : urlPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    res.setHeader("Content-Type", types[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    res.end(data);
  });
}).listen(port, () => {
  console.log(`RUMAIS local server running at http://localhost:${port}/`);
});