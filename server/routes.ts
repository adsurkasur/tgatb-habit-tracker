import type { Express } from "express";
import { createServer, type Server } from "http";
import { createApiRoutes } from "./api-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount API routes
  app.use("/api", createApiRoutes());

  const httpServer = createServer(app);

  return httpServer;
}
