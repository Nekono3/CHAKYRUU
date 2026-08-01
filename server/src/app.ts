import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import authRoutes from "./routes/auth.routes";
import eventsRoutes from "./routes/events.routes";
import guestsRoutes from "./routes/guests.routes";
import wishesRoutes from "./routes/wishes.routes";
import { env } from "./lib/env";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/guests", guestsRoutes);
  app.use("/api/wishes", wishesRoutes);

  if (env.nodeEnv === "production") {
    const clientDist = path.join(__dirname, "../../client/dist");
    app.use(express.static(clientDist));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use((req, res) => res.status(404).json({ error: "Not found" }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
