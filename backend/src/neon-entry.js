// Neon Functions HTTP adapter for the existing Express application.
// A loopback Node HTTP server preserves Express middleware, cookies, streams,
// multipart handling, and the existing route tree without rewriting the API.
process.env.NEON_FUNCTION = "true";
const { app } = await import("./index.js");
import { once } from "node:events";

const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
const localOrigin = `http://127.0.0.1:${address.port}`;

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname + incoming.search, localOrigin);
    const headers = new Headers(request.headers);
    headers.delete("host");
    const init = { method: request.method, headers, redirect: "manual" };
    if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;
    try {
      const response = await fetch(new Request(target, init));
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
    } catch (error) {
      console.error("Express loopback bridge failed:", error?.message || error);
      return Response.json({ error: "API temporarily unavailable." }, { status: 502 });
    }
  },
};
