/**
 * App routes definitions.
 */

import { Express, Request, Response } from "express";
import { UserSchema } from "../dto/user.dto";
import ValidationMiddleware from "../middleware/validation";
import { createUserHandler } from "../controllers/user.controller";

function setRoutes(app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) => {
    res.send("200");
  });

  app.post(
    "/create-user",
    ValidationMiddleware.validateBody(UserSchema),
    createUserHandler
  );
}

export default setRoutes;
