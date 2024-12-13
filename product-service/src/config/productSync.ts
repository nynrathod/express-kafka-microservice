import cron from "node-cron";
import redisClient from "./redisClient";
import { AppDataSource } from "../../data-source";
import { Product } from "../entities/Product";

let cronTask: cron.ScheduledTask | null = null;

const syncProductData = async () => {
  console.log("Checking for keys to sync...");
  try {
    const keys = await redisClient.keys("product:*");

    if (keys.length === 0) {
      console.log("No keys found, skipping sync.");
      stopCronJob();
      return;
    }

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        const parsedData = JSON.parse(data);
        const lastUpdated = parsedData.timestamp ? parsedData.timestamp : 0;
        const currentTime = Date.now();
        const timeDifference = currentTime - lastUpdated;

        if (timeDifference > 30 * 1000) {
          await redisClient.set(key, "locked");
          console.log(`Syncing ${key} with the database`);
          await syncToDb(key, parsedData);
        } else {
          console.log(`Skipping ${key}, updated recently`);
        }
      }
    }
  } catch (error) {
    console.error("Error syncing product data:", error);
  }
};

// Function to sync specific data to the database
const syncToDb = async (key: string, data: any) => {
  const productRepository = AppDataSource.getRepository(Product);
  const productId = key.split(":")[1];
  const product = await productRepository.findOne({ where: { productId } });
  console.log("mydataaaa", data);
  if (product) {
    console.log("yes product");
    product.stock = data.stock;
    await productRepository.save(product);
    console.log(`Stock updated for ${key}`);
    await redisClient.del(key);
  }

  // Implement your DB sync logic here
  console.log(`Data synced for ${key}`);
};

// Function to start the cron job
const startCronJob = () => {
  if (!cronTask) {
    cronTask = cron.schedule("*/5 * * * * *", syncProductData); // Runs every 5 seconds for testing
    console.log("Cron job started to sync product data every 5 seconds.");
  } else {
    console.log("Cron job is already running.");
  }
};

// Function to stop the cron job
const stopCronJob = () => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log("Cron job stopped.");
  } else {
    console.log("No cron job is running.");
  }
};

// Initialize function to check and start the cron job
const initializeCronJob = async () => {
  console.log("Initializing cron job...");
  const keys = await redisClient.keys("product:*");
  if (keys.length > 0) {
    startCronJob();
  } else {
    console.log("No product keys found. Cron job not started.");
  }
};

export { startCronJob, stopCronJob, initializeCronJob };
