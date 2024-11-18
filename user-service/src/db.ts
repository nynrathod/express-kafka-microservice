// db.ts
import { Pool } from "pg";

// PostgreSQL Client Configuration
const pool = new Pool({
  host: "postgres",  // Host should match the service name from docker-compose if you're using Docker
  port: 5432,
  user: "postgres",
  password: "admin",
  database: "ecommdb",
});

pool
    .connect()
    .then(() => {
      console.log("Connected to the database.");
    })
    .catch((error) => {
      console.error("Error connecting to the database:", error.message);
    });

export default pool;
