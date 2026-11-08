
const test = require("node:test");
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");
const request = require("supertest");

const dbFile = path.join(
    os.tmpdir(),
    `securevault-test-${process.pid}.sqlite`
);

process.env.DB_PATH = dbFile;
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET =
    "test-secret-long-enough-for-local-automated-tests";

const app = require("../src/server");

test("SecureVault security regression tests", async (t) => {

    const alice = request.agent(app);
    const bob = request.agent(app);

    await new Promise(resolve => setTimeout(resolve, 200));

    await alice.post("/api/register")
        .send({
            username: "alice_test",
            password: "AlicePassword!123"
        })
        .expect(201);

    await bob.post("/api/register")
        .send({
            username: "bob_test",
            password: "BobPassword!123"
        })
        .expect(201);

    // A01: Broken Access Control
    await t.test(
        "A01: unauthenticated document access is denied",
        async () => {
            await request(app)
                .get("/api/documents")
                .expect(401);
        }
    );

    await t.test(
        "A01: users cannot read/delete another user's document",
        async () => {
            const created = await alice
                .post("/api/documents")
                .send({
                    title: "Private note",
                    body: "Alice content"
                })
                .expect(201);

            const id = created.body.document.id;

            await bob.get(`/api/documents/${id}`).expect(404);

            await bob.delete(`/api/documents/${id}`).expect(404);
        }
    );

    // A05: Injection
    await t.test(
        "A05: SQL injection-shaped login input is rejected",
        async () => {
            await request(app)
                .post("/api/login")
                .send({
                    username: "' OR '1'='1' --",
                    password: "wrong-password"
                })
                .expect(401);
        }
    );

    // A07: Authentication Failures
    await t.test(
        "A07: invalid credentials return a generic error",
        async () => {
            const response = await request(app)
                .post("/api/login")
                .send({
                    username: "alice_test",
                    password: "incorrect-password"
                })
                .expect(401);

            assert.equal(
                response.body.error,
                "Invalid username or password."
            );
        }
    );

    // A02: Security Misconfiguration
    await t.test(
        "A02: security headers are configured",
        async () => {
            const response = await request(app).get("/");

            assert.ok(
                response.headers["x-content-type-options"]
            );

            assert.equal(
                response.headers["x-powered-by"],
                undefined
            );
        }
    );

    // A10: Safe 404 handling
    await t.test(
        "A10: unknown routes do not expose stack traces",
        async () => {
            const response = await request(app)
                .get("/not-a-real-route")
                .expect(404);

            assert.equal(
                response.body.error,
                "Route not found."
            );

            assert.doesNotMatch(
                JSON.stringify(response.body),
                /node_modules|Error:|at\s+\w+/i
            );
        }
    );

    // A10: Safe internal server error handling
    await t.test(
        "A10: internal errors return a generic 500 response",
        async () => {
            const response = await request(app)
                .get("/__test/error")
                .expect(500);

            assert.equal(
                response.body.error,
                "Something went wrong. Please try again."
            );

            assert.doesNotMatch(
                JSON.stringify(response.body),
                /Sensitive internal test error|node_modules|Error:|at\s+\w+/i
            );
        }
    );
});

// Cleanup test database
test("cleanup test database", async () => {

    const db = require("../src/db");

    await new Promise(resolve => db.close(resolve));

    for (const suffix of ["", "-shm", "-wal"]) {
        try {
            fs.unlinkSync(dbFile + suffix);
        } catch {
            // Ignore files that do not exist
        }
    }
});
