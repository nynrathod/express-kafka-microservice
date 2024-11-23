import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { AppDataSource } from "../data-source";
import router from "./routes/router";

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(morgan("combined"));

AppDataSource.initialize().then(() => {
  app.use("/api/orders", router);

  app.listen(PORT, () => {
    console.log(`Order service listening on port ${PORT}`);
  });
});
