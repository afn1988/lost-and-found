/**
 * Validation Middleware 
 */

import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express";

class ValidationMiddleware {
  /**
 * validateBody validates the request body against the schema
 *
 * @static
 * @param {AnyZodObject} schema Zod schema to validate the request body
 * @returns {RequestHandler}
 */
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

  /**
 * validateQuery validates the request query against the schema
 *
 * @static
 * @param {AnyZodObject} schema Zod schema to validate the request query
 * @returns {RequestHandler}
 */
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

  /**
 * validateParams validates the request params against the schema
 *
 * @static
 * @param {AnyZodObject} schema Zod schema to validate the request params
 * @returns {RequestHandler}
 */
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

  /**
 * validate validates the request body, query, and params against the schema
 *
 * @static
 * @param {AnyZodObject} schema Zod schema to validate the request body, query, and params
 * @returns {RequestHandler}
 */
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
