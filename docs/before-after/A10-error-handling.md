# A10 Mishandling Exceptional Conditions

Before (vulnerable): return `err.stack` to the client.

After: log details server-side and return `{ error: "Something went wrong. Please try again." }` with status 500.

This avoids exposing internal paths and stack traces to users. Review the central error middleware and capture a controlled local error response for evidence.
