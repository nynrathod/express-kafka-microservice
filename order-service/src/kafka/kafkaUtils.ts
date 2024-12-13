import { producer } from "./kafka";

/**
 * Sends a message to a Kafka topic.
 * @param topic - The Kafka topic to send the message to.
 * @param message - The message to send.
 * @returns The result metadata about the sent message (partition, offset, etc.).
 */
export const sendKafkaMessage = async (topic: string, message: any) => {
  try {
    // console.log(`Message sent to topic ${topic}:`, message);
    // console.log("Kafka message sent successfully. Metadata:", result);
    return await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    }); // Return the result with metadata such as partition and offset
  } catch (error) {
    console.error(`Error sending message to topic ${topic}:`, error);
    throw error; // Optional: rethrow the error if needed for further handling
  }
};
