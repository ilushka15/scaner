import "dotenv/config";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import database from "./utils/database";
import logger from "./utils/logger";
import registerRoutes from "./utils/routing";
import { swaggerSpec } from "./utils/swagger";
import ApiError from "./utils/api-error";

export default class Server {
  private readonly app: Application;

  public constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static("."));
    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    registerRoutes(this.app);
    this.app.use((_request: Request, response: Response) => response.status(404).json({ message: "Route niet gevonden." }));
    this.app.use((error: unknown, _request: Request, response: Response, _next: unknown) => {
      if (error instanceof ApiError) return response.status(error.status).json({ message: error.message });
      logger.error("Onverwachte serverfout", error);
      return response.status(500).json({ message: "Er is iets misgegaan." });
    });
  }

  public async start(): Promise<void> {
    await database.checkConnection();
    const port = Number(process.env.PORT ?? 3001);
    this.app.listen(port, () => logger.info(`Server gestart op http://localhost:${port}`));
  }
}
