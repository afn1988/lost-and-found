import { Request, Response } from "express";
import logger from "../utils/logger";

function createUserHandler(req: Request, res: Response) {
  res.send("Create User");
}