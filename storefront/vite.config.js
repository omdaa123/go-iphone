import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://go-iphone-api.vercel.app",
        changeOrigin: true,
        secure: true,
        configure(proxy) {
          proxy.on("proxyReq", proxyReq => proxyReq.removeHeader("origin"));
        },
      },
    },
  },
});
