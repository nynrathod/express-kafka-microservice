import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db";

export const createUser = async (
  username: string,
  password: string,
): Promise<any> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const res = await pool.query(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
    [username, hashedPassword],
  );

  return res.rows[0];
};

// Authenticate User
export const authenticateUser = async (
  username: string,
  password: string,
): Promise<any> => {
  const res = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  if (res.rows.length === 0) return null;

  const user = res.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  return isMatch ? user : null;
};

// Generate JWT token for authentication
export const generateAuthToken = (user: any): string => {
  return jwt.sign({ id: user.id, username: user.username }, "jwtPrivateKey", {
    expiresIn: "1h",
  });
};
