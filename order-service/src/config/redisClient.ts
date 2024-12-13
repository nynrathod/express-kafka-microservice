import { createClient } from "redis";

// Create a Redis client
const redisClient = createClient({
  url: "redis://localhost:6379", // Use your Redis URL here
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export const initializeRedis = async () => {
  await redisClient.connect();
  console.log("Connected to Redis");
};

export default redisClient;
