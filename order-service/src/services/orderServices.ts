import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../../data-source";
import { Order } from "../entities/Order";
import { sendKafkaMessage } from "../kafka/kafkaUtils";
import redisClient from "../config/redisClient";
import { processOrderValidationResult } from "../kafka/order.kafka";

const orderRepository = AppDataSource.getRepository(Order);

export const createOrder = async (
  userId: string,
  product: { productId: string; quantity: number },
  totalPrice: number,
) => {
  try {
    const orderId = uuidv4();
    const orderData = {
      userId,
      products: product,
      totalPrice,
      version: 0,
    };

    // Save the initial order data in Redis
    await redisClient.set(orderId, JSON.stringify(orderData));
    console.log(`Order ${orderId} created in Redis.`);

    const productKey = `product:${product.productId}`;
    let productEntity = await redisClient.get(productKey);
    let retries = 2;

    console.log("AfterproductEntity", productEntity);

    // Retry logic for locked state
    while (productEntity === "locked" && retries > 0) {
      console.log(`Product ${product.productId} is locked. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      productEntity = await redisClient.get(productKey);
      retries--;
    }

    if (productEntity === "locked") {
      console.log(
        `Product ${product.productId} is still locked after retries.`,
      );
      throw new Error(
        `Unable to process order due to locked product ${product.productId}.`,
      );
    }

    if (productEntity) {
      const parsedProductEntity = JSON.parse(productEntity);
      console.log(`Product entity found:`, parsedProductEntity);

      // Prepare validation results
      const validationResults = {
        productId: parsedProductEntity.productId,
        status: "available",
        version: parsedProductEntity.version,
        stock: parsedProductEntity.stock,
      };

      // Process the validation results
      await processOrderValidationResult(orderId, validationResults);
      return orderId;
    } else {
      console.log(
        `Product ${product.productId} not found in Redis. Sending Kafka message...`,
      );

      // Send Kafka message for order validation request
      const kafkaResponse = await sendKafkaMessage("order_validation_request", {
        orderId,
        productId: product.productId,
        quantity: product.quantity,
      });

      if (kafkaResponse) {
        console.log(`Kafka message sent successfully for Order ${orderId}.`);
        return orderId;
      } else {
        throw new Error(`Failed to send Kafka message for Order ${orderId}.`);
      }
    }
  } catch (error) {
    console.error("Error creating order or processing validation:", error);
    throw error;
  }
};

export const getOrderStatusService = async (orderId: string) => {
  try {
    const orderData = await redisClient.get(orderId);

    if (orderData) {
      const order = JSON.parse(orderData);
      console.log("yes its redis", order);
      return { status: "pending", source: "Redis" };
    }
    const order = await orderRepository.findOne({
      where: { orderId: orderId },
    });
    console.log("muorder", order);
    if (order) {
      return { status: order.status };
    }

    // throw new Error("Order not found");
  } catch (error) {
    console.error("Error fetching order status:", error);
    // throw new Error("Error fetching order status: " + error);
  }
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  return await orderRepository.findOne({
    where: { id },
  });
};

export const getAllOrders = async (): Promise<Order[]> => {
  return await orderRepository.find();
};
