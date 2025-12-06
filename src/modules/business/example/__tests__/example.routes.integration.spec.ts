/**
 * Integration tests for Example Routes.
 */
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "@/app/app";
import { db } from "@/core/database";

describe("Example routes (integration)", () => {
  const baseUrl = "/api/v1/examples";
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    app = createApp();
    await db().example.deleteMany();
  });

  describe("GET /api/v1/examples (list)", () => {
    it("should list examples (200) with standard success format", async () => {
      await request(app)
        .post(baseUrl)
        .send({ name: "A", description: null })
        .expect(StatusCodes.CREATED);

      await request(app)
        .post(baseUrl)
        .send({ name: "B", description: null })
        .expect(StatusCodes.CREATED);

      const res = await request(app).get(baseUrl).expect(StatusCodes.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(StatusCodes.OK);
      expect(res.body.message).toBe("OK");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
    });

    it("should filter examples by search query", async () => {
      await request(app)
        .post(baseUrl)
        .send({ name: "Alpha", description: null })
        .expect(StatusCodes.CREATED);

      await request(app)
        .post(baseUrl)
        .send({ name: "Beta", description: null })
        .expect(StatusCodes.CREATED);

      const res = await request(app).get(`${baseUrl}?search=alp`).expect(StatusCodes.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.statusCode).toBe(StatusCodes.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]?.name).toBe("Alpha");
    });
  });

  describe("GET /api/v1/examples/:id (find)", () => {
    it("should return example detail (200) with standard success format", async () => {
      const createRes = await request(app)
        .post(baseUrl)
        .send({ name: "Detail example", description: "detail desc" })
        .expect(StatusCodes.CREATED);

      const id = createRes.body.data.id as number;

      const res = await request(app).get(`${baseUrl}/${id}`).expect(StatusCodes.OK);

      expect(res.body).toMatchObject({
        success: true,
        statusCode: StatusCodes.OK,
        message: "OK",
        data: {
          id,
          name: "Detail example",
          description: "detail desc",
        },
      });
    });

    it("should return 404 with standard error format when example not found", async () => {
      const res = await request(app).get(`${baseUrl}/999999`).expect(StatusCodes.NOT_FOUND);

      expect(res.body).toMatchObject({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Example not found",
      });

      expect(res.body.errors).toBeUndefined();
    });
  });

  describe("POST /api/v1/examples (create)", () => {
    it("should create example (201) and return standard success format", async () => {
      const res = await request(app)
        .post(baseUrl)
        .send({
          name: "Sample example",
          description: "Just testing",
        })
        .expect(StatusCodes.CREATED);

      expect(res.body).toMatchObject({
        success: true,
        message: "Created",
        statusCode: StatusCodes.CREATED,
        data: {
          id: expect.any(Number),
          name: "Sample example",
          description: "Just testing",
        },
      });
    });

    it("should return 422 with errors array when body validation fails", async () => {
      const res = await request(app)
        .post(baseUrl)
        .send({
          // missing `name`
          description: "no name field",
        })
        .expect(StatusCodes.UNPROCESSABLE_ENTITY);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(res.body.message).toBe("Validation failed");
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);

      expect(res.body.errors[0]).toEqual(
        expect.objectContaining({
          field: expect.any(String),
          message: expect.any(String),
        }),
      );
    });
  });

  describe("PUT /api/v1/examples/:id (update)", () => {
    it("should update existing example and return standard success format", async () => {
      const createRes = await request(app)
        .post(baseUrl)
        .send({ name: "Old name", description: "old desc" })
        .expect(StatusCodes.CREATED);

      const id = createRes.body.data.id as number;

      const res = await request(app)
        .put(`${baseUrl}/${id}`)
        .send({ name: "New name", description: "updated desc" })
        .expect(StatusCodes.OK);

      expect(res.body).toMatchObject({
        success: true,
        statusCode: StatusCodes.OK,
        message: "OK",
        data: {
          id,
          name: "New name",
          description: "updated desc",
        },
      });
    });

    it("should return 404 when updating non-existent example", async () => {
      const res = await request(app)
        .put(`${baseUrl}/999999`)
        .send({ name: "New name", description: null })
        .expect(StatusCodes.NOT_FOUND);

      expect(res.body).toMatchObject({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Example not found",
      });
      expect(res.body.errors).toBeUndefined();
    });

    it("should return 404 when updating a soft-deleted example", async () => {
      const createRes = await request(app)
        .post(baseUrl)
        .send({ name: "To be deleted", description: "desc" })
        .expect(StatusCodes.CREATED);
      const id = createRes.body.data.id;

      await request(app).delete(`${baseUrl}/${id}`).expect(StatusCodes.OK);

      const res = await request(app)
        .put(`${baseUrl}/${id}`)
        .send({ name: "Resurrected?", description: "should not happen" });

      // CURRENT BUG: Likely 200 OK
      expect(res.status).toBe(StatusCodes.NOT_FOUND);
      expect(res.body).toMatchObject({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Example not found",
      });
    });
  });

  describe("DELETE /api/v1/examples/:id (delete)", () => {
    it("should delete existing example and return standard success format", async () => {
      const createRes = await request(app)
        .post(baseUrl)
        .send({ name: "To delete", description: null })
        .expect(StatusCodes.CREATED);

      const id = createRes.body.data.id as number;

      const res = await request(app).delete(`${baseUrl}/${id}`).expect(StatusCodes.OK);

      expect(res.body).toMatchObject({
        success: true,
        statusCode: StatusCodes.OK,
        message: "OK",
        data: {
          deleted: true,
        },
      });
    });

    it("should return 404 when deleting non-existent example", async () => {
      const res = await request(app).delete(`${baseUrl}/999999`).expect(StatusCodes.NOT_FOUND);

      expect(res.body).toMatchObject({
        success: false,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Example not found",
      });
      expect(res.body.errors).toBeUndefined();
    });
  });
});
