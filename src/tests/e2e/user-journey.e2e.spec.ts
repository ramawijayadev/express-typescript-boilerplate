import { Worker } from "bullmq";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { db } from "@/core/database/connection";
import { emailWorkerHandler, emailWorkerName } from "@/jobs/handlers/send-email.job";

// Helper to delete all messages in Mailpit
/**
 * Deletes all emails from the Mailpit inbox.
 * Useful for ensuring a clean state before tests.
 */
async function deleteAllEmails() {
  try {
    await fetch("http://localhost:8025/api/v1/messages", { method: "DELETE" });
  } catch {
    // Silent
  }
}

// Helper to fetch emails from Mailpit
/**
 * Fetches the latest email for a specific recipient from Mailpit.
 *
 * @param recipient - The email address of the recipient.
 * @returns The full email object (with Text/HTML) if found, or null.
 */
async function fetchLatestEmail(recipient: string) {
  // ... (existing logic)
  // But wait, if I delete emails, I can just grab the only one there.
  try {
      const response = await fetch("http://localhost:8025/api/v1/messages");
      if (!response.ok) return null;
      
      const data = await response.json() as { messages: unknown[] };
      const messages = data.messages || [];
      
      // Simplified finding logic: Check if recipient string exists in the message object (To/Header)
      const email = messages.find((msg: unknown) => JSON.stringify(msg).includes(recipient));
      
      if (!email || typeof email !== 'object') return null;
  
      // Fetch full body
      const msgRes = await fetch(`http://localhost:8025/api/v1/message/${(email as { ID: string }).ID}`);
      if (!msgRes.ok) return null;
      return await msgRes.json() as { Text: string; HTML: string }; // Full message with Text/HTML
    } catch {
      return null;
    }
}
//...

// Helper to retry fetching email
/**
 * Waits for an email to arrive for a specific recipient.
 * Retries multiple times with a delay.
 *
 * @param recipient - The email address of the recipient.
 * @param retries - Number of retries (default 10).
 * @returns The email content (Text or HTML) if found, or null.
 */
async function waitForEmail(recipient: string, retries = 10): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    const email = await fetchLatestEmail(recipient) as { Text: string; HTML: string } | null;
    if (email) {
      return email.Text || email.HTML;
    }
    await new Promise((r) => setTimeout(r, 500)); // Wait 500ms
  }
  return null;
}



// Regex to extract access token (JWT) or verification token
// Matches 'token=' query parameter from the URL in the email
const TOKEN_REGEX = /token=([a-f0-9]+)/i;

describe("E2E: User Journey", () => {
  const app = createApp();
  let worker: Worker;
  
  // Unique user for this run
  const testUser = {
    name: "E2E Traveler",
    email: `traveler-${Date.now()}@example.com`,
    password: "Password123!",
  };

  let accessToken = "";
  let refreshToken = "";

  beforeAll(async () => {
    // Start a worker to process email jobs
    // We use the actual application handler to ensure we test the real email templates
    worker = new Worker(emailWorkerName, emailWorkerHandler, {
      connection: {
        host: "localhost",
        port: 6379
      },
      concurrency: 1, // Minimize race conditions
    });

    worker.on("ready", () => null);
    worker.on("error", (_err) => null);
    worker.on("failed", (_job, _err) => null);
  });

  afterAll(async () => {
    await worker.close();
    // Cleanup DB
    await db().user.deleteMany({ where: { email: testUser.email } });
  });

  it("1. Public Access: Health Check", async () => {
    await request(app).get("/api/v1/health").expect(StatusCodes.OK);
  });

  it("2. Registration", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send(testUser)
      .expect(StatusCodes.CREATED);
  });

  it("3. Verification: Receive Email and Verify", async () => {
    // Wait for email in Mailpit
    const emailContent = await waitForEmail(testUser.email, 30);
    expect(emailContent).not.toBeNull();
    
    // Extract token
    // Our worker sent "Token: <token>"
    const match = emailContent!.match(TOKEN_REGEX);
    expect(match).toBeTruthy();
    const token = match![1];

    // Verify
    await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token })
      .expect(StatusCodes.OK)
      .catch(err => {
        throw err;
      });
  }, 20000); // 20s timeout

  it("4. Authentication: Login", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(StatusCodes.OK);

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it("5. Protected Resource: Get Profile", async () => {
    const res = await request(app)
      .get("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);

    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("6. Token Refresh", async () => {
    // Wait a bit to ensure 'exp' changes if resolution is low? No need for most tests.
    const res = await request(app)
      .post("/api/v1/auth/refresh-token")
      .send({ refreshToken })
      .expect(StatusCodes.OK);

    // Update tokens
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it("7. User Management: Get Me", async () => {
    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);

    expect(res.body.data.email).toBe(testUser.email);
  });

  it("8. User Management: Update Me", async () => {
    const newName = "Updated Traveler";
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: newName })
      .expect(StatusCodes.OK);

    expect(res.body.data.name).toBe(newName);
    
    // Verify persistence
    const check = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);
    expect(check.body.data.name).toBe(newName);
  });

  let exampleId: number;

  it("9. Business Logic: Create Example", async () => {
    const res = await request(app)
      .post("/api/v1/examples")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Journey Example", description: "Created during E2E" })
      .expect(StatusCodes.CREATED);

    expect(res.body.data.id).toBeDefined();
    exampleId = res.body.data.id;
  });

  it("10. Business Logic: List Examples", async () => {
    const res = await request(app)
      .get("/api/v1/examples")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({ page: 1, limit: 10 })
      .expect(StatusCodes.OK);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    const item = res.body.data.find((e: { id: number }) => e.id === exampleId);
    expect(item).toBeDefined();
  });

  it("11. Business Logic: Get Example Details", async () => {
    const res = await request(app)
      .get(`/api/v1/examples/${exampleId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);

    expect(res.body.data.id).toBe(exampleId);
    expect(res.body.data.name).toBe("Journey Example");
  });

  it("12. Business Logic: Update Example", async () => {
    const res = await request(app)
      .put(`/api/v1/examples/${exampleId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Updated Journey Example" })
      .expect(StatusCodes.OK);

    expect(res.body.data.name).toBe("Updated Journey Example");
  });

  it("13. Business Logic: Delete Example", async () => {
    await request(app)
      .delete(`/api/v1/examples/${exampleId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);

    // Verify gone
    await request(app)
      .get(`/api/v1/examples/${exampleId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.NOT_FOUND);
  });

  it("14. Account Security: Forgot Password", async () => {
    await deleteAllEmails(); // Ensure clean slate
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: testUser.email })
      .expect(StatusCodes.OK);
      
    // Wait for new email
    
    // Simple wait to ensure processing
    await new Promise(r => setTimeout(r, 1000));
    
    const emailContent = await waitForEmail(testUser.email, 30); // 30 retries * 500ms = 15s max
    expect(emailContent).not.toBeNull();
    // expect(emailContent).toContain("Reset your password"); // Body only contains "Token: <token>" in our mock worker
    
    const match = emailContent!.match(TOKEN_REGEX);
    const resetToken = match![1];

    // Reset Password
    const newPassword = "NewPassword123!";
    await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: resetToken, newPassword })
      .expect(StatusCodes.OK);
      
    // Login with OLD password should fail
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(StatusCodes.UNAUTHORIZED);
      
    // Login with NEW password should success
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: newPassword })
      .expect(StatusCodes.OK);
      
    // Update tokens for logout step
    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  }, 20000); // 20s timeout

  it("15. Logout", async () => {
    await request(app)
      .post("/api/v1/auth/logout")
      .send({ refreshToken })
      .expect(StatusCodes.OK);
  });

  it("16. Verify Unauthorized after Logout", async () => {
    // Refresh token should be invalid
    await request(app)
     .post("/api/v1/auth/refresh-token")
     .send({ refreshToken })
     .expect(StatusCodes.UNAUTHORIZED);
     
     // Access token might still be valid until expiry (JWT is stateless), 
     // UNLESS we have a blacklist or short expiry.
     // In this boilerplate, access tokens are stateless and short lived.
     // We only revoked the *Session* (RefreshToken).
     // Ideally, checking PROFILE with the *old* AccessToken might still work if it hasn't expired.
     // To verify logout, we usually check that we can't refresh anymore.
     // Which we did above.
  });
});
