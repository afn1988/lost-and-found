import { Request, Response } from "express";
import { LoginUser, User as UserDTO } from "../dto/user.dto";
import { User as UserModel } from "../models";
import logger from "../utils/logger";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "./env/.env.development" });
} else {
  dotenv.config({ path: "./env/.env.development" });
}
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const JWT_EXPIRES_IN = "15m";
const JWT_REFRESH_EXPIRES_IN = "7d";

/**
 * CreateUser handles the creation of a new user
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const createUserHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // The data in req.body has already been validated by the middleware
    const validatedData: UserDTO = req.body;
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

/**
 * LoginUser handles user authentication and token generation
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const loginUserHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // The data in req.body has already been validated by the middleware
    const { email, password }: LoginUser = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Validate password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.warn(`Invalid password attempt for email: ${email}`);
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    console.log("JWT_SECRET", JWT_SECRET);
    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
    // Save refresh token in user document
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info(`User logged in successfully: ${email}`);
    res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
        name: user.name,
      },
    }); // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(`Error during login: ${error.message}`);
    res.status(500).json({ message: "Error during login" });
  }
};

/**
 * RefreshToken handler for generating new access token using refresh token
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const refreshTokenHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token not found" });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string;
      email: string;
    };

    // Find user and check if refresh token matches
    const user = await UserModel.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set new access token in cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    logger.info(`Access token refreshed for user: ${user.email}`);
    res.status(200).json({ message: "Token refreshed successfully" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(`Error refreshing token: ${error.message}`);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
