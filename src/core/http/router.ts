import { Router } from "express";

import { exampleRouter } from "@/modules/platform/example/example.routes";

import type { Express } from "express";

export function registerRoutes(app: Express) {
  const api = Router();

  api.get("/health", (_req, res) => {
    return res.json({ success: true, data: { status: "ok" } });
  });

  api.use("/platform/examples", exampleRouter);

  app.use("/api/v1", api);
}
