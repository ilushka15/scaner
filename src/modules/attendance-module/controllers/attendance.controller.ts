import { Request, Response, Router } from "express";
import AbstractRouter from "../../../utils/abstract-router";
import AttendanceService from "../services/attendance.service";
import { groupInput, scanInput, studentInput } from "../dto/attendance.dto";
import { validateDTO } from "../../../utils/dto-validator";

export default class AttendanceController extends AbstractRouter {
  private readonly service = new AttendanceService();

  public registerRoutes(): Router {
    const router = Router();
    router.get("/state", async (request, response) => {
      const date = typeof request.query.date === "string" ? request.query.date : undefined;
      response.json(await this.service.getState(date));
    });
    router.post("/scan", validateDTO(scanInput), async (request, response) => response.status(200).json(await this.service.scan(request.body.code)));
    router.get("/students", async (_request, response) => response.json(await this.service.getStudents()));
    router.get("/students/:id", async (request, response) => response.json(await this.service.getStudent(Number(request.params.id))));
    router.post("/students", validateDTO(studentInput), async (request, response) => response.status(201).json(await this.service.addStudent(request.body)));
    router.put("/students/:id", validateDTO(studentInput), async (request, response) => response.json(await this.service.updateStudent(Number(request.params.id), request.body)));
    router.delete("/students/:id", async (request, response) => { await this.service.deleteStudent(Number(request.params.id)); response.status(204).send(); });
    router.get("/groups", async (_request, response) => response.json(await this.service.getGroups()));
    router.post("/groups", validateDTO(groupInput), async (request, response) => response.status(201).json(await this.service.addGroup(request.body)));
    router.delete("/groups/:name", async (request, response) => { await this.service.deleteGroup(request.params.name); response.status(204).send(); });
    return router;
  }
}
