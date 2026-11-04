/** Last middleware in the chain. Logs the full error server-side (wire this
 * to Sentry/Datadog/etc. in production) but only ever sends a generic
 * message to the client — never a stack trace, query text, or internal
 * file paths, which is exactly what you don't want handed to an attacker. */
export function errorHandler(err, req, res, _next) {
  // Expected client-side rejections (sold-out, validation, conflicts) get a
  // one-line log; only genuine 5xx failures get the full stack trace.
  const expected = err.statusCode && err.statusCode < 500;
  if (expected) console.warn(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${err.statusCode} ${err.message}`);
  else console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} →`, err);

  if (res.headersSent) return;

  // Map common database constraint violations to clean client errors
  // instead of a generic 500 (never expose the raw database message).
  if (err.code === "23503") { err.statusCode = 400; err.message = "A referenced item does not exist."; }
  if (err.code === "23505") { err.statusCode = 409; err.message = "That item already exists."; }
  if (err.code === "22P02") { err.statusCode = 400; err.message = "Invalid id format."; }

  const status = err.statusCode || 500;
  const message = status === 500 ? "Something went wrong. Please try again." : err.message;
  res.status(status).json({ error: message });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not found." });
}
