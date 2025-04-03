import { Queue, Worker, JobsOptions } from "bullmq";
import redisClient from "./redisClient"; // Redis client initialization
import { AppDataSource } from "../../data-source";
import { Product } from "../entities/Product";

const productSyncQueue = new Queue("product-sync", { connection: redisClient });

// Function to sync product data to the database
const syncToDb = async (key: string, data: any) => {
  const productRepository = AppDataSource.getRepository(Product);
  const productId = key.split(":")[1];
  const product = await productRepository.findOne({ where: { productId } });

  if (product) {
    product.stock = data.stock;
    console.log("hellopro", product);
    await productRepository.save(product);
    console.log(`Stock updated for ${key}`);
    await redisClient.del(key); // Clear the key after successful sync
  }

  console.log(`Data synced for ${key}`);
};

// Function to process product sync logic
const processProductSyncJob = async () => {
  console.log("Checking for keys to sync...");

  try {
    const keys = await redisClient.keys("product:*");

    if (keys.length === 0) {
      console.log("No keys found to sync. Stopping repeatable job.");
      await stopRepeatableJob();
      return;
    }

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        const parsedData = JSON.parse(data);
        console.log("myparseddata", parsedData);
        const lastUpdated = parsedData.timestamp ? parsedData.timestamp : 0;
        const currentTime = Date.now();
        const timeDifference = currentTime - lastUpdated;

        if (timeDifference > 15 * 1000) {
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

// Worker to process the jobs in the queue
const startWorker = () => {
  const worker = new Worker(
    "product-sync",
    async () => {
      await processProductSyncJob();
    },
    { connection: redisClient },
  );

  worker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job failed: ${job?.id}`, err);
  });

  console.log("Worker started to process product sync jobs.");
};

// Function to schedule the repeatable job
const scheduleRepeatableJob = async () => {
  const jobOptions: JobsOptions = {
    repeat: {
      every: 5_000, // Run every 5 seconds
    },
  };

  const existingJobs = await productSyncQueue.getJobSchedulers();
  console.log("existingJobs", existingJobs);
  if (existingJobs.length === 0) {
    await productSyncQueue.add("sync-product", {}, jobOptions);
    console.log(
      "Repeatable job scheduled to sync product data every 5 seconds.",
    );
  }
};

// Function to stop the repeatable job
const stopRepeatableJob = async () => {
  const repeatableJobs = await productSyncQueue.getJobSchedulers();
  for (const job of repeatableJobs) {
    await productSyncQueue.removeJobScheduler(job.key);
    console.log("Repeatable job stopped.");
  }
};

// Function to initialize the sync logic
const initializeSync = async () => {
  console.log("Initializing product sync...");
  const keys = await redisClient.keys("product:*");
  if (keys.length > 0) {
    console.log("Keys found. Starting repeatable job.");
    await scheduleRepeatableJob();
  } else {
    console.log("No keys found. Repeatable job will not start.");
  }
};

export {
  startWorker,
  scheduleRepeatableJob,
  stopRepeatableJob,
  initializeSync,
};
