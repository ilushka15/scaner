import { Router } from "express";

export default abstract class AbstractRouter {
  public abstract registerRoutes(): Router;
}
