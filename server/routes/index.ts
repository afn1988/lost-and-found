/**
 * App routes definitions.
 */

import { Express, Request, Response } from "express";
import { LoginUserSchema, UserRole, UserSchema } from "../dto/user.dto";
import ValidationMiddleware from "../middleware/validation.middleware";
import { createUserHandler, loginUserHandler } from "../controllers/user.controller";
import { authenticateJWT, authorizeRole, AuthRequest } from "../middleware/auth.middleware";

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

  const testController = {
    test: async (req: AuthRequest, res: Response) => {
      try {
        // Access authenticated user info
        const email = req.user?.email; 
  
        res.json({ 
          message: 'Protected route accessed successfully',
          user: { email: email }
        });
      } catch (error) { 
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
  
  app.get(
    '/test',
    authenticateJWT,
    authorizeRole([UserRole.AGENT]),
    testController.test
  );
}

export default setRoutes;
