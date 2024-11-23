import { DataSource } from "typeorm";
import { join } from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: 5432,
  username: "postgres",
  password: process.env.POSTGRES_PASSWORD || "admin",
  database: process.env.POSTGRES_DB || "ecommdb",
  synchronize: false,
  logging: false,
  entities: [join(__dirname, "./src/entities/*.{js,ts}")],
  migrations: [join(__dirname, "./src/migrations/*.{js,ts}")],
  subscribers: [],
});
