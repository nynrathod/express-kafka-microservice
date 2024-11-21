import { DataSource } from "typeorm";
import { join } from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: 5432,
  username: "postgres",
  password: "admin",
  database: "ecommdb",
  synchronize: false,
  logging: false,
  entities: [join(__dirname, "./src/entities/*.{js,ts}")],
  migrations: [join(__dirname, "./src/migrations/*.{js,ts}")],
  subscribers: [],
});
