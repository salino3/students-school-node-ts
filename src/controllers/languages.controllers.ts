import { Request, Response } from "express";
import { pool } from "../db";

const addLanguages = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.send(400).json({ message: "Name language is required" });
    }

    const sqlQUery = `INSERT INTO programming_languages (name) VALUES ($1)`;

    const result = await pool.query(sqlQUery, [name]);

    if (result.rowCount && result.rowCount > 0) {
      return res.send("Language added to the list");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export { addLanguages };
