import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { AppDataSource } from "../data-source";
import router from "./routes/router";
import { initializeKafka } from "./kafka/kafka";
import { initializeOrderKafkaHandlers } from "./kafka/order.kafka";
import { initializeRedis } from "./config/redisClient";

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(morgan("combined"));
AppDataSource.initialize()
  .then(async () => {
    // Start Kafka and Redis in parallel
    await Promise.all([initializeKafka(), initializeRedis()]);

    // Initialize Kafka handlers without blocking the rest of the app
    initializeOrderKafkaHandlers().catch(console.error);

    // Continue with app setup
    app.use("/api/orders", router);
    app.listen(PORT, () => {
      console.log(`Order service listening on port ${PORT}`);
    });
  })
  .catch(console.error);
