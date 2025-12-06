import { Worker } from "bullmq";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { queueConfig } from "@/config/queue";
import { SmtpEmailSender } from "@/core/mail/mailer";
import { db } from "@/core/database/connection";

// Helper to delete all messages in Mailpit
async function deleteAllEmails() {
  try {
    await fetch("http://localhost:8025/api/v1/messages", { method: "DELETE" });
  } catch (err) {
    console.warn("Failed to clear Mailpit", err);
  }
}

// Helper to fetch emails from Mailpit
async function fetchLatestEmail(recipient: string) {
  // ... (existing logic)
  // But wait, if I delete emails, I can just grab the only one there.
  try {
      const response = await fetch("http://localhost:8025/api/v1/messages");
      if (!response.ok) return null;
      
      const data = await response.json();
      const messages = (data as any).messages || [];
      
      // Simplified finding logic: Check if recipient string exists in the message object (To/Header)
      const email = messages.find((msg: any) => JSON.stringify(msg).includes(recipient));
      
      if (!email) return null;
  
      // Fetch full body
      const msgRes = await fetch(`http://localhost:8025/api/v1/message/${email.ID}`);
      if (!msgRes.ok) return null;
      return await msgRes.json() as any; // Full message with Text/HTML
    } catch (error) {
      console.warn("Mailpit fetch failed. Is Mailpit running?", error);
      return null;
    }
}
//...

// Helper to retry fetching email
async function waitForEmail(recipient: string, retries = 10): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    const email = await fetchLatestEmail(recipient);
    if (email) {
      return email.Text || email.HTML;
    }
    await new Promise((r) => setTimeout(r, 500)); // Wait 500ms
  }
  return null;
}

// Regex to extract access token (JWT) or verification token
// Assuming token in email is like "Token: <hex>" or link
const TOKEN_REGEX = /Token:\s+([a-f0-9]+)/; // As seen in InMemoryJobQueue, but we need to match what EmailTemplate sends.
// If valid email templates are not yet implemented, the SmtpEmailSender might send standard text.
// Let's assume standard template for now or check previous learnings.

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
    // Start a temporary worker to process email jobs
    // We use the application's SmtpEmailSender, which now defaults to Mailpit (localhost:1025) in .env
    // This validates our standardized configuration.
    const emailSender = new SmtpEmailSender();
    
    // Explicitly reusing the same connection config
    worker = new Worker("email-queue", async (job) => {
       console.log("Worker processing job:", job.name, job.data);
       const { email, token } = job.data;
       let subject = "Subject";
       let text = `Token: ${token}`;
       
       if (job.name === "verify-email") subject = "Verify your email";
       if (job.name === "password-reset") subject = "Reset your password";

       await emailSender.send({ to: email, subject, text });
       console.log("Worker sent email to:", email);
    }, {
      connection: {
        host: queueConfig.redis.host,
        port: queueConfig.redis.port,
        password: queueConfig.redis.password,
      },
    });

    worker.on("ready", () => console.log("Worker is ready and connected to Redis"));
    worker.on("error", (err) => console.error("Worker error:", err));
    worker.on("failed", (job, err) => console.error(`Job ${job?.id} failed:`, err));
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
        console.error("Verify Email Failed Response:", err.response?.body);
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
    const item = res.body.data.find((e: any) => e.id === exampleId);
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
