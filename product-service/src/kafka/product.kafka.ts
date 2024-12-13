import { consumer } from "./kafka";
import { validateProducts } from "../services/productServices";
import { sendMessage } from "./kafkautils";

interface OrderValidationRequest {
  orderId: string;
  productId: string;
  quantity: number;
}

// Topic-specific handler map
const topicHandlers: Record<
  string,
  (message: { value: Buffer }) => Promise<void>
> = {
  order_validation_request: async ({ value }) => {
    try {
      const { orderId, productId, quantity }: OrderValidationRequest =
        JSON.parse(value.toString());
      console.log(
        `Processing order validation request for order ${orderId}, product ${productId}, quantity ${quantity}.`,
      );

      const validationResults = await validateProducts(productId, quantity);
      if (validationResults) {
        console.log("hellovalidationResults", validationResults);
        await sendMessage("order_validation_result", {
          validationResults,
          orderId,
          version: validationResults.version,
        });

        console.log(`Validation results sent for order ${orderId}.`);
      }
    } catch (err) {
      console.error("Error processing order validation request:", err);
    }
  },
};

/**
 * Initialize Kafka Consumer
 */
export const initializeOrderKafkaHandlers = async () => {
  try {
    const topics = Object.keys(topicHandlers);

    await consumer.subscribe({ topics, fromBeginning: true });
    console.log(`Subscribed to topic: ${topics}`);

    // Run the consumer loop
    consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (message.value !== null && topicHandlers[topic]) {
          // Process messages for the topic
          await topicHandlers[topic]({ value: message.value });
        } else {
          console.warn(`Unhandled topic: ${topic} or message has null value`);
        }
      },
    });

    // Let Kafka consume in the background, app can start immediately
    setImmediate(() => {
      console.log("Order Kafka handlers initialized.");
    });

    // console.log("Order Kafka handlers initialized.");
  } catch (err) {
    console.error("Error initializing Order Kafka handlers:", err);
  }
};
