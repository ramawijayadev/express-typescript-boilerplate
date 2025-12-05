# Local Testing Guide

This guide explains how to run and test the application, including the new Email Verification and Password Reset features.

> **Note on Architecture**: By default, the application runs the background worker in the same process as the API server for simplicity (`ENABLE_BACKGROUND_JOBS=true`). In a high-scale production environment, you may want to set this to `false` and run the worker in a separate process.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js installed.
2.  **Redis**: Required for the background job queue (BullMQ).
    *   **Mac (Homebrew)**: `brew install redis && brew services start redis`
    *   **Docker**: `docker run -d -p 6379:6379 redis`
    *   **Linux**: `sudo apt install redis-server`
3.  **Mailtrap Account** (or any SMTP server):
    *   Sign up at [mailtrap.io](https://mailtrap.io).
    *   Go to "Email Testing" -> "Inboxes" -> "Your Inbox".
    *   Copy the "SMTP Settings" (Host, Port, User, Pass).

## Environment Setup

1.  Create a `.env` file in the root directory (if you haven't already).
2.  Copy content from `.env.example` to `.env`.
3.  Fill in your **Redis** and **Mailtrap** credentials:

    ```bash
    # Mail (from Mailtrap)
    SMTP_HOST=smtp.mailtrap.io
    SMTP_PORT=2525
    SMTP_USER=your_mailtrap_user
    SMTP_PASS=your_mailtrap_password
    SMTP_FROM=noreply@example.com

    # Queue (Default is usually fine for local)
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```

## Starting the Application

Run the following command to start the server **and** the background workers:

```bash
pnpm dev
```

You should see logs indicating the server is running and jobs are initialized:
```
INFO: Server running on port 3000
INFO: Background jobs initialized
```

## Testing the Flow

### 1. Register a New User

Use an API client like **Postman**, **Insomnia**, or `curl`.

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**What happens:**
1.  User is created in the database.
2.  An email verification job is added to the queue.
3.  The worker processes the job and sends an email via Mailtrap.

### 2. Verify Email

1.  Go to your **Mailtrap Inbox**.
2.  You should see an email with the subject "Verify your email address".
3.  The email body contains a link like:
    `http://localhost:3000/verify-email?token=<LONG_TOKEN_STRING>`
4.  Copy the `token` value from that URL.
5.  Call the verify endpoint:

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{ "token": "<PASTE_TOKEN_HERE>" }'
```

**Result**: You should receive `{"message": "Email verified successfully"}`.

### 3. Forgot Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{ "email": "john@example.com" }'
```

1.  Check your **Mailtrap Inbox**.
2.  Find the "Reset your password" email.
3.  Copy the token from the link.

### 4. Reset Password

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<PASTE_TOKEN_HERE>",
    "newPassword": "NewPassword456"
  }'
```

**Result**: Password is updated, and all previous sessions are revoked.

## Troubleshooting

-   **"Connection refused" (Redis)**: Make sure your Redis server is running (`redis-cli ping` should return `PONG`).
-   **"Connection timeout" (Mail)**: Check your internet connection and verify SMTP configs in `.env`.
-   **No emails in Mailtrap**: Check the terminal logs where you ran `pnpm dev`. Look for errors starting with `[ERROR]`.
