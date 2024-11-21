import { Request, Response } from "express";
import {
  authenticateUser,
  createUser,
  generateAuthToken,
} from "../services/userService";
import { ResponseHandler } from "../utils/responseHandler";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await createUser(username, password);

    ResponseHandler.success(res, "User created successfully!", { user });
  } catch (error) {
    if (error instanceof Error) {
      ResponseHandler.error(res, error.message);
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await authenticateUser(username, password);

    if (user) {
      const token = generateAuthToken(user);
      ResponseHandler.success(res, "Login successful!", { token });
    } else {
      ResponseHandler.error(res, "Invalid credentials");
    }
  } catch (error) {
    if (error instanceof Error) {
      ResponseHandler.error(res, error.message);
    }
  }
};
