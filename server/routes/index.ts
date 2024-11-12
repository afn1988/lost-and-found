/**
 * App routes definitions.
 */

import { Express, Request, Response } from "express";
import { LoginUserSchema, UserSchema } from "../dto/user.dto";
import ValidationMiddleware from "../middleware/validation";
import { createUserHandler, loginUserHandler } from "../controllers/user.controller";

function setRoutes(app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) => {
    res.send("200");
  });

  app.post(
    "/create-user",
    ValidationMiddleware.validateBody(UserSchema),
    createUserHandler
  );

  app.post(
    "/login", 
    ValidationMiddleware.validateBody(LoginUserSchema), 
    loginUserHandler
  );
}

export default setRoutes;
