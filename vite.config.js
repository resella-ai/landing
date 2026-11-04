import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: resolve(projectRoot, "react-build"),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(projectRoot, "index.html"),
        vinted: resolve(projectRoot, "foto-prodotti-vinted/index.html"),
        depop: resolve(projectRoot, "foto-prodotti-depop/index.html"),
        about: resolve(projectRoot, "cos-e-resella/index.html"),
      },
    },
  },
});
