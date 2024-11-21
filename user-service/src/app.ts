import "reflect-metadata";
import express, { Application } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import userRoutes from "./routes/router";
import { AppDataSource } from "../data-source";

const app: Application = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(morgan("combined"));

AppDataSource.initialize().then(() => {
  app.use("/api/users", userRoutes);

  app.listen(PORT, () => {
    console.log(`User service listening on port ${PORT}`);
  });
});
