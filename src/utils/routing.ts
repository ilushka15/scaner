import { Application } from "express";
import AttendanceController from "../modules/attendance-module/controllers/attendance.controller";

export default function registerRoutes(app: Application): void {
  app.use("/api/v1/attendance", new AttendanceController().registerRoutes());
}
