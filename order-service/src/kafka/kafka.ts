import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-service",
  brokers: ["localhost:9092"],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({
  groupId: "order-group",
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
    console.log("Kafka producer connected");

    await consumer.connect();
    console.log("Kafka consumer connected");
  } catch (error) {
    console.error("Error initializing Kafka:", error);
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
