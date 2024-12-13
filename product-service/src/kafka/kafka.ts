import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "product-service",
  brokers: ["localhost:9092"], // Adjust as per setup
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({
  groupId: "product-group",
  rebalanceTimeout: 3000, // Set to 3 seconds
  retry: {
    restartOnFailure: function (e) {
      return Promise.resolve(true);
    },
  },
});

export const initializeKafka = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    console.log("Kafka producer and consumer connected.");
  } catch (err) {
    console.error("Error initializing Kafka:", err);
    process.exit(1);
  }
};

process.on("SIGINT", async () => {
  console.log("Shutting down Kafka...");
  try {
    await producer.disconnect();
    await consumer.disconnect();
    console.log("Kafka producer and consumer disconnected.");
  } catch (err) {
    console.error("Error during Kafka shutdown:", err);
  } finally {
    process.exit(0);
  }
});
