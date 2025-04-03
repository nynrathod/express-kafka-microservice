import { Queue, Worker } from "bullmq";
import redisClient from "../config/redisClient";
import { processOrderValidationResult } from "../kafka/order.kafka";
import { sendKafkaMessage } from "../kafka/kafkaUtils"; // Kafka utility function to send messages

// Define the queue for processing orders
export const orderQueue = new Queue("orderQueue", {
  connection: { host: "localhost", port: 6379 },
});

// Define a worker to process orders
export const worker = new Worker(
  "orderQueue",
  async (job) => {
    console.log("asdafsafjob", job.data);
    const { orderId, userId, products, totalPrice } = job.data;
    const productKey = `product:${products.productId}`;
    let productEntity = await redisClient.get(productKey);

    if (productEntity) {
      console.log(`Product ${products.productId} found in Redis.`);
      const parsedProductEntity = JSON.parse(productEntity);

      const validationResults = {
        productId: parsedProductEntity.productId,
        status: "available", // Assuming the stock is available for now
        version: parsedProductEntity.version,
        stock: parsedProductEntity.stock,
      };

      console.log(`Order ${orderId} processed successfully from Redis data.`);
      await processOrderValidationResult(orderId, validationResults);
    } else {
      console.log(
        `Product ${products.productId} not found in Redis. Requesting via Kafka.`,
      );

      try {
        // Send Kafka message to request product data
        const response = await sendKafkaMessage("order_validation_request", {
          orderId,
          productId: products.productId,
          quantity: products.quantity,
        });

        if (response) {
          await redisClient.set(productKey, JSON.stringify(response));
          console.log("Kafka response: ", response);

          const validationResults = {
            productId: response.productId,
            status: "available", // Assuming the stock is available for now
            version: response.version,
            stock: response.stock,
          };

          console.log(
            `Order ${orderId} processed successfully from Kafka data.`,
          );
          await processOrderValidationResult(orderId, validationResults);
        } else {
          await pauseQueue();
          console.log(
            `Product data not found for order ${orderId}. Job will wait until re-triggered.`,
          );
        }
      } catch (error) {
        console.error(
          `Error fetching product data for order ${orderId}: ${error.message}`,
        );
        console.log(`Job ${job.id} will remain pending.`);
        // Do not retry, leave the job in the queue
      }
    }
  },
  {
    connection: { host: "localhost", port: 6379 },
  },
);

// Log worker events
worker.on("ready", () => {
  console.log("Worker is ready and listening for jobs...");
});

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job.id} with error: ${err.message}`);
});

export async function pauseQueue() {
  await orderQueue.pause();
  console.log("Order queue has been paused.");
}

// Resume the queue
export async function resumeQueue() {
  await orderQueue.resume();
  console.log("Order queue has been resumed.");
}
