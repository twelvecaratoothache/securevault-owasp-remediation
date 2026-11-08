const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");

const authForm = document.getElementById("auth-form");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");

const authSubmit = document.getElementById("auth-submit");
const authMessage = document.getElementById("auth-message");
const passwordHint = document.getElementById("password-hint");

const logoutBtn = document.getElementById("logout-btn");
const userLabel = document.getElementById("user-label");

const documentForm = document.getElementById("document-form");
const documentMessage = document.getElementById("document-message");
const documentsList = document.getElementById("documents-list");

let currentMode = "login";

// API helper
async function api(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
    }

    return data;
}

// Show login or registration form
function setMode(mode) {
    currentMode = mode;

    authMessage.textContent = "";
    authMessage.className = "message";

    loginTab.classList.toggle("active", mode === "login");
    registerTab.classList.toggle("active", mode === "register");

    authSubmit.textContent = mode === "login" ? "Login" : "Create Account";

    passwordHint.classList.toggle("hidden", mode !== "register");

    document.getElementById("password").setAttribute(
        "autocomplete",
        mode === "login" ? "current-password" : "new-password"
    );
}

loginTab.addEventListener("click", () => setMode("login"));
registerTab.addEventListener("click", () => setMode("register"));

// Registration and login
authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    authMessage.textContent = "Please wait...";
    authMessage.className = "message";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (currentMode === "register" && password.length < 10) {
        authMessage.textContent = "Password must contain at least 10 characters.";
        return;
    }

    try {
        const endpoint =
            currentMode === "login" ? "/api/login" : "/api/register";

        const result = await api(endpoint, {
            method: "POST",
            body: JSON.stringify({ username, password })
        });

        showDashboard(result.user);
        authForm.reset();

    } catch (error) {
        authMessage.textContent = error.message;
    }
});

// Display dashboard
function showDashboard(user) {
    authSection.classList.add("hidden");
    dashboard.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");

    userLabel.textContent = `Welcome, ${user.username}`;

    loadDocuments();
}

// Return to login screen
function showLogin() {
    dashboard.classList.add("hidden");
    authSection.classList.remove("hidden");
    logoutBtn.classList.add("hidden");

    userLabel.textContent = "";
    documentsList.replaceChildren();

    setMode("login");
}

// Logout
logoutBtn.addEventListener("click", async () => {
    try {
        await api("/api/logout", {
            method: "POST"
        });

        showLogin();

    } catch (error) {
        alert(error.message);
    }
});

// Create a document
documentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("document-title").value.trim();
    const body = document.getElementById("document-body").value.trim();

    documentMessage.textContent = "Saving...";
    documentMessage.className = "message";

    try {
        await api("/api/documents", {
            method: "POST",
            body: JSON.stringify({ title, body })
        });

        documentForm.reset();

        documentMessage.textContent = "Document saved successfully!";
        documentMessage.className = "message success";

        loadDocuments();

    } catch (error) {
        documentMessage.textContent = error.message;
    }
});

// Load documents
async function loadDocuments() {
    documentsList.replaceChildren();

    try {
        const result = await api("/api/documents");

        if (result.documents.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "No documents yet. Create your first document!";
            documentsList.appendChild(empty);
            return;
        }

        result.documents.forEach((doc) => {
            const card = document.createElement("article");
            card.className = "document-item";

            const title = document.createElement("h3");
            title.textContent = doc.title;

            const body = document.createElement("p");
            body.textContent = doc.body;

            const date = document.createElement("span");
            date.className = "document-date";
            date.textContent = doc.created_at
                ? `Created: ${doc.created_at}`
                : "";

            const deleteButton = document.createElement("button");
            deleteButton.className = "btn delete-btn";
            deleteButton.textContent = "Delete Document";

            deleteButton.addEventListener("click", () => {
                deleteDocument(doc.id);
            });

            card.append(title, body, date, deleteButton);
            documentsList.appendChild(card);
        });

    } catch (error) {
        if (error.message.includes("log in")) {
            showLogin();
            return;
        }

        const message = document.createElement("p");
        message.textContent = error.message;
        documentsList.appendChild(message);
    }
}

// Delete a document
async function deleteDocument(id) {
    const confirmed = confirm("Are you sure you want to delete this document?");

    if (!confirmed) return;

    try {
        await api(`/api/documents/${id}`, {
            method: "DELETE"
        });

        loadDocuments();

    } catch (error) {
        alert(error.message);
    }
}

// Check whether the user already has a session
async function checkSession() {
    try {
        const result = await api("/api/me");
        showDashboard(result.user);
    } catch {
        showLogin();
    }
}

checkSession();