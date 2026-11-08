# SecureVault Security Remediation Report

Scope: local SecureVault application and its test database only.

| Category | Before / risk | Remediation | Evidence |
|---|---|---|---|
| A01 Broken Access Control | Document lookup by ID alone permits IDOR | Read/delete queries constrain both document ID and authenticated owner ID | Cross-user test in `tests/security.test.js` |
| A02 Security Misconfiguration | Missing defensive HTTP headers and framework fingerprint | Helmet middleware and `app.disable("x-powered-by")` | Header test |
| A05 Injection | SQL built by concatenating untrusted input | Prepared statements with `?` placeholders and bound parameters | SQLi-shaped username rejected |
| A07 Authentication Failures | Plaintext/weak password handling and repeated guesses | bcrypt cost 12, generic errors, session regeneration and 10-attempt/15-minute limiter | Invalid login test and limiter configuration |
| A10 Mishandling Exceptional Conditions | Internal stack traces can disclose implementation details | Generic 500 response; diagnostics logged server-side | Error handler review and unknown-route test |

## Dependency audit
The developer reported `npm audit` returned `found 0 vulnerabilities` after upgrading sqlite3 to 6.0.1. Re-run `npm audit` immediately before submission because advisories change over time.

## Evidence to capture
Capture test output, relevant HTTP requests/responses, and screenshots of the running application. Redact passwords, session cookies, IDs that grant access, and tokens.

## Production hardening
Use a persistent production session store (not Express MemoryStore), HTTPS, an appropriate CSRF defence, secure secret management, backups, monitoring, and a supported production database. Do not deploy a vulnerable variant or store real sensitive documents here.
