import express, { Application } from "express";
import userRoutes from "./routes/router";
import bodyParser from "body-parser";

const app: Application = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
