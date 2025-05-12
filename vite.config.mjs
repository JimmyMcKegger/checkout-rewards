import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { gadget } from "gadget-server/vite";
import { remixViteOptions } from "gadget-server/remix";
import { vitePlugin as remix } from "@remix-run/dev";

import dotenv from "dotenv";
dotenv.config();


export default defineConfig({
  plugins: [react(), gadget(), remix({ ...remixViteOptions, ssr: false })],
  clearScreen: false,
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ["dotenv/config"],
    mockReset: true,
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
