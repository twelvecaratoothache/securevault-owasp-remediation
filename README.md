# SecureVault — OWASP Remediation Project

A local document workspace demonstrating five defensive controls mapped to OWASP Top 10:2025.

## Features
- Registration/login with bcrypt password hashing
- Session authentication and session regeneration
- Private document CRUD with per-user ownership checks
- Parameterised SQLite queries
- Login rate limiting and generic authentication errors
- Helmet security headers and disabled framework fingerprint
- Central generic error handler

## Run (Windows PowerShell)
```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd start
```
Open http://localhost:3000. On macOS/Linux use `npm install`, `cp .env.example .env`, and `npm start`.

## Test and audit
```powershell
npm.cmd test
npm.cmd audit
```

## Five remediations
| OWASP 2025 | Risk | Fix |
|---|---|---|
| A01 Broken Access Control | IDOR on documents | Query by document ID AND authenticated owner ID |
| A02 Security Misconfiguration | Missing defensive headers/framework disclosure | Helmet and disable X-Powered-By |
| A05 Injection | SQL string concatenation | Parameterised SQL with bound values |
| A07 Authentication Failures | Weak password/session protections and brute-force attempts | bcrypt, session regeneration, generic errors, rate limit |
| A10 Mishandling Exceptional Conditions | Stack trace/internal detail disclosure | Central generic error handler |

See `docs/SECURITY-REPORT.md` and `docs/before-after/`.

## GitHub
Create a public repository, then:
```bash
git init
git add .
git commit -m "Complete SecureVault OWASP remediation"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/securevault-owasp-remediation.git
git push -u origin main
```
Replace YOUR-USERNAME with your GitHub username.

## Production limitations
This is an educational local project, not production-ready storage. Express MemoryStore is unsuitable for production. Before deployment, configure a persistent session store, HTTPS, CSRF protection suitable for cookie sessions, secure secret management, backups and monitoring. Never commit `.env`, `data/`, credentials, cookies or real private documents.
