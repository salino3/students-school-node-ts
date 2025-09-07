import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world! This is a backend with TypeScript and Express.");
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
