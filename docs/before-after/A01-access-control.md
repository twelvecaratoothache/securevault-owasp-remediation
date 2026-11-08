# A01 Broken Access Control

Before (vulnerable): `SELECT * FROM documents WHERE id = ?` using only a user-controlled document ID.

After (secure): `SELECT ... FROM documents WHERE id = ? AND owner_id = ?` with `[id, req.session.user.id]`.

The owner condition is enforced server-side for both reads and deletes. The automated test creates a document as Alice and confirms Bob receives 404 when trying to read or delete it.
