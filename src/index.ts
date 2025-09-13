import express, { Request, Response } from "express";
import { pool } from "./db";
import { PORT } from "./utils/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import routerStudents from "./routes/students.routes";

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());

// Set up CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONT_END_PORT
        : "http://localhost:7700",
    credentials: true,
  })
);

//
app.get("/", (req: Request, res: Response) => {
  res.send("Hello world! This is a backend with TypeScript and Express.");
});

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/students", routerStudents);

// Log the current environment
if (process.env.NODE_ENV === "production") {
  console.log("Running in production mode");
} else if (process.env.NODE_ENV === "development") {
  console.log("Running in development mode");
} else {
  console.log("Unknown environment");
}

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
