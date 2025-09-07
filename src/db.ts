import pg from "pg";
import { USER, HOST, PASSWORD, DATABASE, PORT_DB } from "./utils/config";

const pool = new pg.Pool({
  user: USER,
  host: HOST,
  password: PASSWORD,
  database: DATABASE,
  port: parseInt(PORT_DB ?? "", 10),
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Database connection successful at:", res.rows[0].now);
  }
});

export { pool };
