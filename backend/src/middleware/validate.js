/** Wraps a zod schema: validates req.body server-side before any handler
 * touches the database. The frontend doing its own validation is a UX nicety,
 * not security — this is the part that actually matters. */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request data.",
        details: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}
