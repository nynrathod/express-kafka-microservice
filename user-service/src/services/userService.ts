import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../data-source";
import { Users } from "../entities/User";

export const createUser = async (
  username: string,
  password: string,
): Promise<any> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const userRepository = AppDataSource.getRepository(Users);

  const user = userRepository.create({
    username,
    password: hashedPassword,
  });

  await userRepository.save(user);

  return user;
};

export const authenticateUser = async (
  username: string,
  password: string,
): Promise<any> => {
  const userRepository = AppDataSource.getRepository(Users);

  const user = await userRepository.findOneBy({ username });

  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);

  return isMatch ? user : null;
};

export const generateAuthToken = (user: any): string => {
  return jwt.sign({ id: user.id, username: user.username }, "jwtPrivateKey", {
    expiresIn: "10d",
  });
};
