import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSaveIntegration, handleGetIntegrations, handleGetIntegration } from "./routes/integrations";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Integration routes
  app.post("/api/integrations", handleSaveIntegration);
  app.get("/api/integrations", handleGetIntegrations);
  app.get("/api/integrations/:type/:name", handleGetIntegration);

  return app;
}
