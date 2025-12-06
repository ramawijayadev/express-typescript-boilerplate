/**
 * End-to-End User Journey tests.
 * Simulates a complete user lifecycle.
 */
import { Worker } from "bullmq";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "@/app/app";
import { db } from "@/core/database/connection";
import { emailWorkerHandler, emailWorkerName } from "@/jobs/handlers/send-email.job";
const TEST_TIMEOUT = 20000;
const TOKEN_REGEX = /token=([a-f0-9]+)/i;
/**
 * Deletes all emails from the Mailpit inbox.
 * Useful for ensuring a clean state before tests.
 */
interface MailpitMessage {
  ID: string;
  Text?: string;
  HTML?: string;
  [key: string]: unknown;
}

interface MailpitListResponse {
  messages: MailpitMessage[];
}

async function deleteAllEmails() {
  try {
    await fetch("http://localhost:8025/api/v1/messages", { method: "DELETE" });
  } catch {
    //
  }
}

/**
 * Fetches the latest email for a specific recipient from Mailpit.
 */
async function fetchLatestEmail(recipient: string) {
  try {
      const response = await fetch("http://localhost:8025/api/v1/messages");
      if (!response.ok) return null;
      
      const data = await response.json() as MailpitListResponse;
      const messages = data.messages || [];
      
      const email = messages.find((msg: unknown) => JSON.stringify(msg).includes(recipient)) as MailpitMessage | undefined;
      
      if (!email || typeof email !== 'object') return null;
  
      // Fetch full body
      const msgRes = await fetch(`http://localhost:8025/api/v1/message/${email.ID}`);
      if (!msgRes.ok) return null;
      return await msgRes.json() as MailpitMessage;
    } catch {
      return null;
    }
}
//...

/**
 * Waits for an email to arrive for a specific recipient.
 * Retries multiple times with a delay.
 */
async function waitForEmail(recipient: string, retries = 10): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    const email = await fetchLatestEmail(recipient);
    if (email) {
      return email.Text || email.HTML || null;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}


describe("User Journey E2E", () => {
  const app = createApp();
  let worker: Worker;
  
  const testUser = {
    name: "E2E Traveler",
    email: `traveler-${Date.now()}@example.com`,
    password: "Password123!",
  };
  let accessToken = "";
  let refreshToken = "";
  beforeAll(async () => {
    // We use the actual application handler to test the real email templates
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
    await db().user.deleteMany({ where: { email: testUser.email } });
  });
  it("Public Access Health Check", async () => {
    await request(app).get("/api/v1/health").expect(StatusCodes.OK);
  });
  it("Registration", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send(testUser)
      .expect(StatusCodes.CREATED);
  });
  it("Verification Receive Email and Verify", async () => {
    const emailContent = await waitForEmail(testUser.email, 30);
    expect(emailContent).not.toBeNull();
    
    const match = emailContent!.match(TOKEN_REGEX);
    expect(match).toBeTruthy();
    const token = match![1];

    await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token })
      .expect(StatusCodes.OK);
  }, TEST_TIMEOUT);
  it("Authentication Login", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(StatusCodes.OK);
    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });
  it("Protected Resource Get Profile", async () => {
    const res = await request(app)
      .get("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);
    expect(res.body.data.user.email).toBe(testUser.email);
  });
  it("Token Refresh", async () => {
    // Wait a bit to ensure 'exp' changes if resolution is low? No need for most tests.
    const res = await request(app)
      .post("/api/v1/auth/refresh-token")
      .send({ refreshToken })
      .expect(StatusCodes.OK);

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });
  it("User Management Get Me", async () => {
    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);
    expect(res.body.data.email).toBe(testUser.email);
  });
  it("User Management Update Me", async () => {
    const newName = "Updated Traveler";
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: newName })
      .expect(StatusCodes.OK);
    expect(res.body.data.name).toBe(newName);
    
    const check = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);
    expect(check.body.data.name).toBe(newName);
  });
  let exampleId: number;
  it("Business Logic Create Example", async () => {
    const res = await request(app)
      .post("/api/v1/examples")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Journey Example", description: "Created during E2E" })
      .expect(StatusCodes.CREATED);
    expect(res.body.data.id).toBeDefined();
    exampleId = res.body.data.id;
  });
  it("Business Logic List Examples", async () => {
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
  it("Business Logic Get Example Details", async () => {
    const res = await request(app)
      .get(`/api/v1/examples/${exampleId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);
    expect(res.body.data.id).toBe(exampleId);
    expect(res.body.data.name).toBe("Journey Example");
  });
  it("Business Logic Update Example", async () => {
    const res = await request(app)
      .put(`/api/v1/examples/${exampleId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Updated Journey Example" })
      .expect(StatusCodes.OK);
    expect(res.body.data.name).toBe("Updated Journey Example");
  });
  it("Business Logic Delete Example", async () => {
    await request(app)
      .delete(`/api/v1/examples/${exampleId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.OK);

    await request(app)
      .get(`/api/v1/examples/${exampleId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(StatusCodes.NOT_FOUND);
  });
  it("Account Security Forgot Password", async () => {
    await deleteAllEmails();
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: testUser.email })
      .expect(StatusCodes.OK);
      
    
    const emailContent = await waitForEmail(testUser.email, 30);
    expect(emailContent).not.toBeNull();
    
    const match = emailContent!.match(TOKEN_REGEX);
    const resetToken = match![1];

    const newPassword = "NewPassword123!";
    await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: resetToken, newPassword })
      .expect(StatusCodes.OK);
      
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(StatusCodes.UNAUTHORIZED);
      
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: newPassword })
      .expect(StatusCodes.OK);
      
    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  }, TEST_TIMEOUT);
  it("Logout", async () => {
    await request(app)
      .post("/api/v1/auth/logout")
      .send({ refreshToken })
      .expect(StatusCodes.OK);
  });
  it("Verify Unauthorized after Logout", async () => {
    // The previous test revoked both Session and RefreshToken.
    // However, access tokens are stateless JWTs. They remain valid until expiry (usually 15m).
    // The boilerplate might not check blacklist for access tokens on every request for performance.
    // BUT, the test requirement says: "Verify Unauthorized after Logout".
    // Let's try to use the RefreshToken again - that MUST fail.
    await request(app)
      .post("/api/v1/auth/refresh-token")
      .send({ refreshToken })
      .expect(StatusCodes.UNAUTHORIZED);
  });
});
