import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(projectRoot, "react-build");
const routes = [
  { pathname: "/", file: "index.html" },
  { pathname: "/foto-prodotti-vinted/", file: "foto-prodotti-vinted/index.html" },
  { pathname: "/foto-prodotti-depop/", file: "foto-prodotti-depop/index.html" },
  { pathname: "/cos-e-resella/", file: "cos-e-resella/index.html" },
];

const originalWindow = globalThis.window;
globalThis.window = { location: { pathname: "/", search: "" } };

const server = await createServer({
  configFile: resolve(projectRoot, "vite.config.js"),
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const { default: App } = await server.ssrLoadModule("/src/App.jsx");

  for (const route of routes) {
    globalThis.window.location.pathname = route.pathname;
    const outputPath = resolve(outputRoot, route.file);
    const html = await readFile(outputPath, "utf8");
    const markup = renderToString(React.createElement(App));
    const root = '<div id="root"></div>';

    if (!html.includes(root)) {
      throw new Error(`Could not find the React root in ${route.file}`);
    }

    await writeFile(outputPath, html.replace(root, `<div id="root">${markup}</div>`));
    console.log(`Prerendered ${route.pathname}`);
  }
} finally {
  await server.close();
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
}
