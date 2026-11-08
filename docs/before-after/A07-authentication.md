# A07 Authentication Failures

Before: plaintext password comparison, no throttling, and no session regeneration.

After: bcrypt password hashes (cost 12), generic login failure, express-rate-limit (10 attempts per 15 minutes), and session regeneration after successful login.

The test suite checks generic invalid-credential responses. Rate limiting is configured in the login route and should also be manually verified with repeated local requests.
