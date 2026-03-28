import dotenv from 'dotenv';
dotenv.config();

import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeDatabase } from "./db/database";
import { runMigrations } from "./db/migrations";
import chatRouter from "./routes/chat";
import ticketsRouter from "./routes/tickets";
import dashboardRouter from "./routes/dashboard";
import helpdeskRouter from "./routes/helpdesk";
import healthRouter from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/chat", chatRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/helpdesk", helpdeskRouter);
app.use("/api/health", healthRouter);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

async function bootstrap(): Promise<void> {
  try {
    const db = initializeDatabase();
    runMigrations(db);
    logger.info("Database initialized and migrations applied.");

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();

export default app;