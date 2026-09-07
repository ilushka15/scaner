import { Request, Response, NextFunction } from "express";
import ApiError from "./api-error";

type Validator<T> = (body: unknown) => T;

export function validateDTO<T>(validator: Validator<T>) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    try {
      request.body = validator(request.body);
      next();
    } catch (error) {
      next(error instanceof ApiError ? error : new ApiError("Validatie mislukt.", 400));
    }
  };
}
