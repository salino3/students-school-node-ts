import express, { Request, Response } from "express";
import { pool } from "./db";
import { PORT } from "./utils/config";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world! This is a backend with TypeScript and Express.");
});

// New endpoint to get all students from the database
app.get("/students", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM students");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
