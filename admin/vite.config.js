import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_ORIGIN = process.env.API_ORIGIN || "http://127.0.0.1:4000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/admin": {
        target: API_ORIGIN,
        changeOrigin: true,
        secure: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));
        },
      },
    },
  },
});
