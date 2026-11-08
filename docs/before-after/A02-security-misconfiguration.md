# A02 Security Misconfiguration

Before: Express app with no security-header middleware and default framework fingerprint.

After: `app.disable("x-powered-by"); app.use(helmet());`

Helmet sets commonly recommended HTTP security headers. The test verifies `X-Content-Type-Options` exists and `X-Powered-By` is absent.
