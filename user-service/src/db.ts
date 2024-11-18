
import { Pool } from "pg";

const pool = new Pool({
  host: "postgres",
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
