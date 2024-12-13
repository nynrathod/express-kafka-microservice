import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { AppDataSource } from "../data-source";
import router from "./routes/router";
import { initializeKafka } from "./kafka/kafka";
import { initializeOrderKafkaHandlers } from "./kafka/product.kafka";
import { initializeCronJob, startCronJob } from "./config/productSync";

const app = express();
const PORT = 4000;

// Middleware
app.use(bodyParser.json());
app.use(morgan("combined"));

AppDataSource.initialize()
  .then(async () => {
    // Start Kafka and Redis initialization in parallel
    await initializeKafka();
    await initializeOrderKafkaHandlers();

    initializeCronJob().catch(console.error);

    // Proceed with the app setup without waiting for Kafka consumer to be ready
    app.use("/api/products", router);

    app.listen(PORT, () => {
      console.log(`Product service listening on port ${PORT}`);
    });
  })
  .catch(console.error);
