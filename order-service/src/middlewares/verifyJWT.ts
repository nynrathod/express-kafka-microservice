import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import IRequest from "../types/IRequest";

export const SECRET_KEY: Secret = "jwtPrivateKey";

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const verifyJWT = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded as { id: string };

    next();
  } catch (err) {
    res.status(401).send("Please authenticate");
  }
};
