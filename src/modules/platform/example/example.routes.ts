import { Router } from "express";

import { validateBody, validateParams, validateQuery } from "@/core/http/validation.middleware";

import { ExampleController } from "./example.controller";
import { ExampleRepository } from "./example.repository";
import { ExampleService } from "./example.service";

import {
  createExampleSchema,
  exampleIdSchema,
  listExamplesQuerySchema,
  updateExampleSchema,
} from "./example.schemas";

export const exampleRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Examples
 *   description: Example management API
 */

const exampleRepository = new ExampleRepository();
const exampleService = new ExampleService(exampleRepository);
const exampleController = new ExampleController(exampleService);

/**
 * @swagger
 * /platform/examples:
 *   get:
 *     summary: List all examples
 *     tags: [Examples]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of examples
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Example'
 *                 meta:
 *                   type: object
 *                 links:
 *                   type: object
 */
exampleRouter.get("/", validateQuery(listExamplesQuerySchema), (req, res) =>
  exampleController.list(req, res),
);

/**
 * @swagger
 * /platform/examples/{id}:
 *   get:
 *     summary: Get an example by ID
 *     tags: [Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Example ID
 *     responses:
 *       200:
 *         description: Example details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Example'
 *       404:
 *         description: Example not found
 */
exampleRouter.get("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.find(req, res),
);

/**
 * @swagger
 * /platform/examples:
 *   post:
 *     summary: Create a new example
 *     tags: [Examples]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExampleInput'
 *     responses:
 *       201:
 *         description: Example created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Example'
 */
exampleRouter.post("/", validateBody(createExampleSchema), (req, res) =>
  exampleController.create(req, res),
);

/**
 * @swagger
 * /platform/examples/{id}:
 *   put:
 *     summary: Update an example
 *     tags: [Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Example ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExampleInput'
 *     responses:
 *       200:
 *         description: Example updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Example'
 *       404:
 *         description: Example not found
 */
exampleRouter.put(
  "/:id",
  validateParams(exampleIdSchema),
  validateBody(updateExampleSchema),
  (req, res) => exampleController.update(req, res),
);

/**
 * @swagger
 * /platform/examples/{id}:
 *   delete:
 *     summary: Delete an example
 *     tags: [Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Example ID
 *     responses:
 *       200:
 *         description: Example deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted:
 *                       type: boolean
 *       404:
 *         description: Example not found
 */
exampleRouter.delete("/:id", validateParams(exampleIdSchema), (req, res) =>
  exampleController.delete(req, res),
);
