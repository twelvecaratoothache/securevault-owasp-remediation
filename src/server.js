
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const path = require("path");
const db = require("./db");

const app = express();

const production = process.env.NODE_ENV === "production";

if (
    production &&
    (!process.env.SESSION_SECRET ||
        process.env.SESSION_SECRET.length < 32)
) {
    throw new Error(
        "Set SESSION_SECRET to at least 32 characters."
    );
}

// Security middleware
app.disable("x-powered-by");
app.use(helmet());

app.use(express.json({
    limit: "20kb"
}));

app.use(express.urlencoded({
    extended: false,
    limit: "20kb"
}));

// Session configuration
app.use(session({
    name: "securevault.sid",
    secret: process.env.SESSION_SECRET ||
        "local-development-secret-change-before-deploying-32chars",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: production,
        maxAge: 3600000
    }
}));

// Serve frontend files
app.use(express.static(
    path.join(__dirname, "..", "public")
));

// Login rate limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        error: "Too many login attempts. Please try again later."
    }
});

// Input sanitization helper
const clean = (value, maxLength) =>
    typeof value === "string"
        ? value.trim().slice(0, maxLength)
        : "";

// Authentication middleware
function auth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            error: "Please log in to continue."
        });
    }

    next();
}

// REGISTER
app.post("/api/register", async (req, res, next) => {
    try {
        const username = clean(req.body.username, 30);

        const password =
            typeof req.body.password === "string"
                ? req.body.password
                : "";

        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
            return res.status(400).json({
                error: "Username must be 3–30 characters and use letters, numbers or underscores."
            });
        }

        if (password.length < 10 || password.length > 72) {
            return res.status(400).json({
                error: "Password must be between 10 and 72 characters."
            });
        }

        const hash = await bcrypt.hash(password, 12);

        db.run(
            "INSERT INTO users(username,password_hash) VALUES(?,?)",
            [username, hash],
            function (err) {
                if (err) {
                    if (err.code === "SQLITE_CONSTRAINT") {
                        return res.status(409).json({
                            error: "That username is already taken."
                        });
                    }

                    return next(err);
                }

                req.session.regenerate((sessionError) => {
                    if (sessionError) {
                        return next(sessionError);
                    }

                    req.session.user = {
                        id: this.lastID,
                        username
                    };

                    res.status(201).json({
                        user: req.session.user
                    });
                });
            }
        );

    } catch (error) {
        next(error);
    }
});

// LOGIN
app.post("/api/login", loginLimiter, (req, res, next) => {
    const username = clean(req.body.username, 30);

    const password =
        typeof req.body.password === "string"
            ? req.body.password
            : "";

    db.get(
        "SELECT id,username,password_hash FROM users WHERE username=?",
        [username],
        async (err, user) => {
            if (err) {
                return next(err);
            }

            try {
                const valid = user
                    ? await bcrypt.compare(password, user.password_hash)
                    : false;

                if (!valid) {
                    return res.status(401).json({
                        error: "Invalid username or password."
                    });
                }

                req.session.regenerate((sessionError) => {
                    if (sessionError) {
                        return next(sessionError);
                    }

                    req.session.user = {
                        id: user.id,
                        username: user.username
                    };

                    res.json({
                        user: req.session.user
                    });
                });

            } catch (error) {
                next(error);
            }
        }
    );
});

// LOGOUT
app.post("/api/logout", auth, (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }

        res.clearCookie("securevault.sid", {
            httpOnly: true,
            sameSite: "strict",
            secure: production
        });

        res.json({
            ok: true
        });
    });
});

// CURRENT USER
app.get("/api/me", auth, (req, res) => {
    res.json({
        user: req.session.user
    });
});

// GET ALL DOCUMENTS
app.get("/api/documents", auth, (req, res, next) => {
    db.all(
        "SELECT id,title,body,created_at FROM documents WHERE owner_id=? ORDER BY id DESC",
        [req.session.user.id],
        (err, rows) => {
            if (err) {
                return next(err);
            }

            res.json({
                documents: rows
            });
        }
    );
});

// CREATE DOCUMENT
app.post("/api/documents", auth, (req, res, next) => {
    const title = clean(req.body.title, 80);
    const body = clean(req.body.body, 5000);

    if (!title || !body) {
        return res.status(400).json({
            error: "Title and document text are required."
        });
    }

    db.run(
        "INSERT INTO documents(owner_id,title,body) VALUES(?,?,?)",
        [req.session.user.id, title, body],
        function (err) {
            if (err) {
                return next(err);
            }

            res.status(201).json({
                document: {
                    id: this.lastID,
                    title,
                    body
                }
            });
        }
    );
});

// GET SPECIFIC DOCUMENT
app.get("/api/documents/:id", auth, (req, res, next) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({
            error: "Invalid document ID."
        });
    }

    db.get(
        "SELECT id,title,body,created_at FROM documents WHERE id=? AND owner_id=?",
        [id, req.session.user.id],
        (err, document) => {
            if (err) {
                return next(err);
            }

            if (!document) {
                return res.status(404).json({
                    error: "Document not found."
                });
            }

            res.json({
                document
            });
        }
    );
});

// DELETE DOCUMENT
app.delete("/api/documents/:id", auth, (req, res, next) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({
            error: "Invalid document ID."
        });
    }

    db.run(
        "DELETE FROM documents WHERE id=? AND owner_id=?",
        [id, req.session.user.id],
        function (err) {
            if (err) {
                return next(err);
            }

            if (!this.changes) {
                return res.status(404).json({
                    error: "Document not found."
                });
            }

            res.json({
                ok: true
            });
        }
    );
});

// TEST-ONLY ROUTE
// Available only when NODE_ENV is "test"
if (process.env.NODE_ENV === "test") {
    app.get("/__test/error", (req, res, next) => {
        next(new Error("Sensitive internal test error"));
    });
}

// SAFE 404 HANDLER
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found."
    });
});

// CENTRALIZED ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        error: "Something went wrong. Please try again."
    });
});

// START SERVER
if (require.main === module) {
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(
            `SecureVault running at http://localhost:${port}`
        );
    });
}

module.exports = app;
