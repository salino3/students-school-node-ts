import { Request, Response } from "express";
import { pool } from "../db";

//
const addLanguages = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name language is required" });
    }

    const sqlQUery = `INSERT INTO programming_languages (name) VALUES ($1)`;

    const result = await pool.query(sqlQUery, [name]);

    if (result.rowCount && result.rowCount > 0) {
      return res.status(200).send("Language added to the list");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

//
const getListLanguages = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM programming_languages`, []);

    if (result.rows.length > 0) {
      return res.status(200).json(result.rows);
    } else {
      return res.status(404).json(result.rows);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export { addLanguages, getListLanguages };
