import { consumer } from "./kafka";
import redisClient from "../config/redisClient";
import { AppDataSource } from "../../data-source";
import { Order } from "../entities/Order";

interface OrderValidationResult {
  orderId: string;
  validationResults: {
    productId: string;
    status: string;
    version: number;
    stock: number;
  };
}

const orderRepository = AppDataSource.getRepository(Order);

// Topic-specific handler map
const topicHandlers: Record<
  string,
  (message: { value: Buffer }) => Promise<void>
> = {
  order_validation_result: async ({ value }) => {
    try {
      const { orderId, validationResults }: OrderValidationResult = JSON.parse(
        value.toString(),
      );

      await processOrderValidationResult(orderId, validationResults);
    } catch (err) {
      console.error("Error processing order validation result:", err);
    }
  },
};

export async function processOrderValidationResult(
  orderId: string,
  validationResults: {
    status: string;
    version: number;
    productId: string;
    stock: number;
  },
  retryCount = 0,
) {
  const RETRY_LIMIT = 3; // Maximum retries
  const RETRY_DELAY = 2000; // Delay between retries in milliseconds

  if (validationResults.status === "available") {
    const redisOrderData = await redisClient.get(orderId);
    if (redisOrderData) {
      const parsedRedisOrder = JSON.parse(redisOrderData);

      const prevProductVersion = await redisClient.get(
        `product:${validationResults.productId}`,
      );

      if (prevProductVersion) {
        const parsedPrevVersion = JSON.parse(prevProductVersion);

        if (parsedPrevVersion.version === 55) {
          const productDataString = await redisClient.get(
            `product:${validationResults.productId}`,
          );
          if (!productDataString) {
            console.log("Product data not found in Redis");
            return;
          }

          const productData = JSON.parse(productDataString);
          productData["stock"] =
            productData.stock - parsedRedisOrder.products.quantity;
          productData.version = parsedPrevVersion.version - 1;
          productData.timestamp = Date.now();

          await redisClient.set(
            `product:${validationResults.productId}`,
            JSON.stringify(productData),
          );

          parsedRedisOrder.orderId = orderId;
          parsedRedisOrder.status = "success";
          await orderRepository.save(parsedRedisOrder);

          await redisClient.del(orderId);
          console.log(`Order ${orderId} validated and saved successfully.`);
        } else {
          console.log(`Version mismatch for Order ${orderId}.`);
          // Optionally, send a failure notification or retry logic

          if (retryCount < RETRY_LIMIT) {
            console.log(
              `Retrying Order ${orderId}... Attempt ${retryCount + 1}`,
            );
            setTimeout(() => {
              processOrderValidationResult(
                orderId,
                validationResults,
                retryCount + 1,
              );
            }, RETRY_DELAY);
          } else {
            console.log(
              `Retry limit reached for Order ${orderId}. Marking as failed.`,
            );
            // Optionally handle retry failure here
          }
        }
      }
    }
  } else {
    await redisClient.del(orderId);
    console.log(`Order ${orderId} validation failed.`);
  }
}

export const initializeOrderKafkaHandlers = async () => {
  try {
    const topics = Object.keys(topicHandlers);

    await consumer.subscribe({ topics, fromBeginning: true });
    console.log(`Subscribed to topic: ${topics}`);

    consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (message.value !== null && topicHandlers[topic]) {
          await topicHandlers[topic]({ value: message.value });
        } else {
          console.warn(`Unhandled topic: ${topic} or message has null value`);
        }
      },
    });

    setImmediate(() => {
      console.log("Order Kafka handlers initialized.");
    });
  } catch (err) {
    console.error("Error initializing Order Kafka handlers:", err);
  }
};
