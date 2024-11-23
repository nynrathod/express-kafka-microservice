import { Request } from "express";

interface User {
  id: string;
  email?: string; // Add any other properties you expect from the JWT payload
}

export default interface IRequest extends Request {
  user?: User;
}
