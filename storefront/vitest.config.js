import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", testTimeout: 30000, hookTimeout: 30000, env: { VITE_API_URL: "http://localhost:4090" } },
});
