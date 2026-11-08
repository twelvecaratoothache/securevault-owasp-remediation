# 🔐 SecureVault – OWASP Security Remediation

A secure document management web application developed to demonstrate the identification, prevention, and remediation of common web application security vulnerabilities based on the OWASP Top 10.

SecureVault allows users to register, authenticate, and securely manage their personal documents while implementing multiple application security controls.

---

## 📌 Project Overview

Web applications often face security threats such as unauthorized access, SQL injection, weak authentication, and improper error handling.

The objective of this project is to develop a secure document management application and implement remediations for five selected OWASP Top 10 vulnerability categories.

The application provides user registration, login, document creation, document listing, and document deletion with appropriate security controls.

Automated security tests are included to verify the implemented protections.

---

## 🎯 Project Objectives

- Understand common web application security vulnerabilities.
- Identify and remediate selected OWASP Top 10 vulnerabilities.
- Implement secure user authentication and session management.
- Prevent SQL injection attacks.
- Enforce proper access control between users.
- Configure HTTP security headers.
- Implement secure error handling.
- Validate security improvements through automated testing.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime environment |
| Express.js | Web application framework |
| SQLite | Database |
| HTML5 | Frontend structure |
| CSS3 | Frontend styling |
| JavaScript | Frontend functionality |
| bcryptjs | Password hashing |
| express-session | Session management |
| Helmet | HTTP security headers |
| express-rate-limit | Login rate limiting |
| dotenv | Environment configuration |
| Node.js Test Runner | Automated security testing |

---

## 🛡️ OWASP Top 10 Vulnerabilities Addressed

This project focuses on five selected OWASP vulnerability categories.

### 1. A01 – Broken Access Control

**Vulnerability:**

Unauthorized users may access or modify resources belonging to other users.

**Implemented Remediations:**

- Authentication required for protected resources.
- Document ownership verification.
- User-specific document retrieval.
- Ownership checks before document deletion.

### 2. A02 – Security Misconfiguration

**Vulnerability:**

Improper server configuration may expose sensitive application information and increase the attack surface.

**Implemented Remediations:**

- Helmet security middleware.
- Disabled the `X-Powered-By` header.
- Configured secure session cookie attributes.
- Restricted incoming request body sizes.

### 3. A05 – Injection

**Vulnerability:**

Malicious input may manipulate database queries and potentially expose or modify stored information.

**Implemented Remediations:**

- Parameterized SQL queries.
- Avoidance of unsafe SQL query construction.
- Input validation.

### 4. A07 – Identification and Authentication Failures

**Vulnerability:**

Weak authentication mechanisms may allow unauthorized users to access application accounts.

**Implemented Remediations:**

- Password hashing using bcrypt.
- Password length validation.
- Login rate limiting.
- Session regeneration after successful authentication.
- Generic invalid-login responses.

### 5. A10 – Mishandling of Exceptional Conditions

**Vulnerability:**

Improper error handling may expose internal application details, stack traces, or sensitive information.

**Implemented Remediations:**

- Centralized error-handling middleware.
- Generic error messages returned to clients.
- Safe handling of unknown routes.
- Server-side error logging.

---

## ✨ Application Features

- User registration.
- Secure user login and logout.
- Password hashing.
- Session-based authentication.
- Document creation.
- Document listing.
- Document deletion.
- User-specific document access.
- SQL injection protection.
- Login rate limiting.
- HTTP security headers.
- Centralized error handling.

---

## 📂 Project Structure

```text
securevault-owasp-remediation/
│
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── src/
│   ├── server.js
│   └── db.js
│
├── tests/
│   └── security.test.js
│
├── docs/
│   ├── SECURITY-REPORT.md
│   └── before-after/
│       ├── A01-access-control.md
│       ├── A02-security-misconfiguration.md
│       ├── A05-injection.md
│       ├── A07-authentication.md
│       └── A10-error-handling.md
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Installation and Setup

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/twelvecaratoothache/securevault-owasp-remediation.git
```

### Step 2: Navigate to the Project Directory

```bash
cd securevault-owasp-remediation
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file using `.env.example` as a reference.

Configure the required environment variables before starting the application.

### Step 5: Start the Application

```bash
npm start
```

Open your browser and navigate to:

```text
http://localhost:3001
```

---

## 🧪 Security Testing

Automated security tests are implemented using the Node.js built-in test runner.

The test suite verifies the following security controls:

| Test Case | OWASP Category |
|---|---|
| Unauthenticated access is rejected | A01 |
| Users cannot access another user's documents | A01 |
| Users cannot delete another user's documents | A01 |
| SQL injection-shaped login input is rejected | A05 |
| Generic invalid login response | A07 |
| Security headers are configured | A02 |
| Unknown routes return safe errors | A10 |
| Internal errors return generic responses | A10 |

### Running the Security Tests

For Windows PowerShell:

```powershell
$env:NODE_ENV="test"
npm.cmd test
```

### Test Results

Latest recorded test results:

- **Total tests:** 9
- **Passed:** 9
- **Failed:** 0

All nine automated tests passed during the latest recorded test run.

---

## 🔍 Dependency Security Audit

The project's dependencies were checked using npm audit.

Run:

```powershell
npm.cmd audit
```

Latest recorded result:

```text
found 0 vulnerabilities
```

This result reflects the dependency audit performed during development.

---

## 📄 Project Documentation

Detailed documentation is available in the `docs/` directory.

- **SECURITY-REPORT.md:** Overall security assessment and remediation report.
- **A01-access-control.md:** Broken Access Control remediation.
- **A02-security-misconfiguration.md:** Security Misconfiguration remediation.
- **A05-injection.md:** Injection prevention.
- **A07-authentication.md:** Authentication security improvements.
- **A10-error-handling.md:** Secure error-handling implementation.

---

## ⚠️ Security Considerations

This project is developed for educational and security demonstration purposes.

Before production deployment, additional security measures are required, including:

- A persistent production-ready session store.
- CSRF protection.
- HTTPS configuration.
- Production environment hardening.
- Additional security testing and code review.

The current implementation should not be considered production-ready.

---

## 🚀 Future Enhancements

- Multi-factor authentication.
- Role-based access control.
- CSRF protection.
- Secure file upload and download.
- Audit logging.
- Improved password policies.
- Persistent production session storage.
- Cloud deployment.

---

## 👨‍💻 Author

**Sameer Shaik**

GitHub: [@twelvecaratoothache](https://github.com/twelvecaratoothache)

Project Repository:

[SecureVault – OWASP Security Remediation](https://github.com/twelvecaratoothache/securevault-owasp-remediation)

---

## 📜 License

Developed for educational purposes, internship learning, and practical understanding of web application security.

