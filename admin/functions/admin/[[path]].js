export async function onRequest({ request, env }) {
  const functionUrl = env.NEON_FUNCTION_URL;
  const originSecret = env.CLOUDFLARE_ORIGIN_SECRET;
  if (!functionUrl || !originSecret || originSecret.length < 32) {
    return Response.json({ error: "API is not configured." }, { status: 503 });
  }
  const incoming = new URL(request.url);
  const upstream = new URL(functionUrl);
  upstream.pathname = incoming.pathname;
  upstream.search = incoming.search;

  // Never trust a client-supplied copy of the private origin credential.
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.set("x-go-iphone-origin-secret", originSecret);

  const init = { method: request.method, headers, redirect: "manual" };
  if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;
  try {
    const response = await fetch(new Request(upstream, init));
    const responseHeaders = new Headers(response.headers);
    // Browser-visible URLs remain same-origin; don't leak upstream redirects.
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: responseHeaders });
  } catch {
    return Response.json({ error: "Admin API is temporarily unavailable." }, { status: 502 });
  }
}
