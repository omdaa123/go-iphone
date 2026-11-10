import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_ORIGIN = process.env.API_ORIGIN || "https://go-iphone-api.vercel.app";

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
