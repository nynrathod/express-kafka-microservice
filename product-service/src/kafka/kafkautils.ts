import { producer } from "./kafka";

export const sendMessage = async (
  topic: string,
  message: Record<string, any>,
) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Message sent to topic ${topic}:`, message);
  } catch (err) {
    console.error(`Error sending message to topic ${topic}:`, err);
  }
};
