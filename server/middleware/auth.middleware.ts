/**
 * Authentication middleware
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { User } from "../models";
import { UserRole } from "../dto/user.dto";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export const authenticateJWT: RequestHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET not defined");
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string,
      role: UserRole, 
    };

    req.user = decoded;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Authentication error:", error);
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }
      if (error instanceof jwt.TokenExpiredError) {
         res.status(401).json({ message: "Token expired" });
         return;
      }
       res.status(401).json({ message: "Authentication failed" });
       return;
    }
    logger.error("Unknown authentication error");
    res.status(401).json({ message: "Authentication failed" });
    return;
  }
};

export const authorizeRole = (roles: string[]): RequestHandler => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    try {
      if (!req.user?.userId) {
        logger.warn("Authorization attempt without ID in token");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await User.findById(req.user.userId);

      if (!user) {
        logger.warn(`User not found for email: ${req.user.userId}`);
        res.status(401).json({ message: "User not found" });
        return;
      }

      if (!roles.includes(user.role)) {
        logger.warn(
          `Invalid role access attempt - Email: ${
            user.email
          }, Required roles: ${roles.join(", ")}, Current role: ${user.role}`
        );
        res.status(403).json({
          message: "Forbidden",
          required: roles,
          current: user.role,
        });
        return;
      }

      next();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`Authorization error: ${errorMessage}`);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  };
};
