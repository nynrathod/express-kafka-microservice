import { Response } from "express";

export class ResponseHandler {
  static success(res: Response, message: string, data: any = null): void {
    res.status(200).json({
      status: "success",
      message,
      data,
    });
  }

  static error(res: Response, message: string, statusCode: number = 400): void {
    res.status(statusCode).json({
      status: "error",
      message,
    });
  }
}
