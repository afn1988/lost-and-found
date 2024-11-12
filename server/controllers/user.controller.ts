import { Request, Response } from "express";
import { User } from "../dto/user.dto";
import UserModel from "../models/user.model";
import logger from "../utils/logger";

export const createUserHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // The data in req.body has already been validated by the middleware
    const validatedData: User = req.body;
    // You can safely use the validated data
    const user = new UserModel(validatedData);
    await user.save();
    logger.info(`User created successfully: ${user.email}`);
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.code === 11000) {
      logger.error(`Email already exists: ${req.body.email}`);
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    logger.error(`Error creating user: ${error.message}`);
    res.status(500).json({ message: "Error creating user" });
  }
};
