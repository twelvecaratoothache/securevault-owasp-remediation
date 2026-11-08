# A05 Injection

Before (vulnerable): concatenate username into SQL string.

After (secure): `db.get("SELECT ... FROM users WHERE username=?", [username], callback)`.

Bound parameters keep user input separate from SQL syntax. The automated test submits an SQL injection-shaped username and expects 401.
