/// <reference types="vitest" />

import { defineConfig } from "vite";
import { gadget } from "gadget-server/vite";
import { remixViteOptions } from "gadget-server/remix";
import { vitePlugin as remix } from "@remix-run/dev";

export default defineConfig({
  plugins: [gadget(), remix({ ...remixViteOptions, ssr: false })],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ["dotenv/config"],
    mockReset: true,
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
