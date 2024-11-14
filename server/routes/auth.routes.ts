import { Router } from "express";
import { LoginUserSchema, UserSchema } from "../dto/user.dto";
import ValidationMiddleware from "../middleware/validation.middleware";
import { createUserHandler, loginUserHandler } from "../controllers/user.controller";

const router: Router = Router();

router.post(
  "/create-user",
  ValidationMiddleware.validateBody(UserSchema),
  createUserHandler
);

router.post(
  "/login",
  ValidationMiddleware.validateBody(LoginUserSchema),
  loginUserHandler
);

export default router;