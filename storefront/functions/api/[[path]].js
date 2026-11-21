export async function onRequest({ request, env }) {
  const functionUrl = env.NEON_FUNCTION_URL;
  if (!functionUrl) {
    return Response.json({ error: "API is not configured." }, { status: 503 });
  }

  const incoming = new URL(request.url);
  const upstream = new URL(functionUrl);
  upstream.pathname = incoming.pathname;
  upstream.search = incoming.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  try {
    const response = await fetch(new Request(upstream, init));
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return Response.json({ error: "The store API is temporarily unavailable." }, { status: 502 });
  }
}
