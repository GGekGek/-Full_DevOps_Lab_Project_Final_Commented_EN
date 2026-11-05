/**
 * Centralized Express error handler.
 * Ensures consistent JSON error shape across the API.
 * - Expected errors (4xx) return their own message.
 * - Unexpected errors (5xx) are logged and return a generic message,
 *   so internal details never leak to the client.
 */
export function errorHandler (err, _req, res, _next) {
  const status = err?.status ?? 500
  if (status >= 500) {
    console.error(err)
    return res.status(status).json({ error: true, message: 'Internal Server Error' })
  }
  res.status(status).json({ error: true, message: err?.message ?? 'Error' })
}

/** Creates an Error carrying an HTTP status, to pass to next(). */
export function httpError (status, message) {
  const err = new Error(message)
  err.status = status
  return err
}
