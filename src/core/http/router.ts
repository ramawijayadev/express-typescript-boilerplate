import { Express, Router } from "express";

export function registerRoutes(app: Express) {
  const api = Router();

  api.get("/health", (req, res) => {
    return res.json({
      success: true,
      data: {
        status: "ok",
      },
    });
  });

  app.use("/api/v1", api);
}
