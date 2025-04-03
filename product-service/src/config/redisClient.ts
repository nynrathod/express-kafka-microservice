import Redis from "ioredis";

// Create a Redis client using ioredis
const redisClient = new Redis({
  host: "localhost", // Redis server hostname
  port: 6379, // Redis server port (default: 6379)
  // You can also use `url` if you have a complete Redis URI like redis://localhost:6379
  // url: "redis://localhost:6379",
  maxRetriesPerRequest: null,
});

// Handle Redis errors
redisClient.on("error", (err) => console.log("Redis Client Error", err));

export const initializeRedis = async () => {
  try {
    await redisClient.ping(); // Check Redis connection
    console.log("Connected to Redis");
  } catch (err) {
    console.log("Error connecting to Redis", err);
  }
};

export default redisClient;
