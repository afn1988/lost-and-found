import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express";

class ValidationMiddleware {
  static validateBody(schema: AnyZodObject): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        await schema.parseAsync(req.body);
        next();
      } catch (error) {
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: (error as ZodError).errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
    };
  }

  static validateQuery(schema: AnyZodObject): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        await schema.parseAsync(req.query);
        next();
      } catch (error) {
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: (error as ZodError).errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
    };
  }

  static validateParams(schema: AnyZodObject): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        await schema.parseAsync(req.params);
        next();
      } catch (error) {
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: (error as ZodError).errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
    };
  }

  static validate(schema: AnyZodObject): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        next();
      } catch (error) {
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: (error as ZodError).errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
    };
  }
}

export default ValidationMiddleware;
