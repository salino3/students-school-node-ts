import { Request, Response } from "express";
import { pool } from "../db";

//
const addLanguage = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name language is required" });
    }

    const sqlQUery = `INSERT INTO programming_languages (name) VALUES ($1);`;

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
    const result = await pool.query(`SELECT * FROM programming_languages;`, []);

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

//
const getLanguageById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send({ message: "ID is required" });
    }

    const sqlQuery = `SELECT * FROM programming_languages WHERE language_id = $1;`;

    const result = await pool.query(sqlQuery, [id]);

    if (result.rows.length > 0) {
      console.log(result.rowCount);
      return res.status(200).json(result.rows[0]);
    } else {
      return res.status(404);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

//
const updateNameLanguage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).send("Name is required");
    }

    const sqlQuery = `
      UPDATE programming_languages
      SET name = $1
      WHERE language_id = $2;
      `;

    const result = await pool.query(sqlQuery, [name, id]);

    if (result.rowCount === 0) {
      return res.status(404).send("Programming language not found");
    }

    return res.status(200).send("Programming language successfully updated.");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

//
const deleteLanguage = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send({ message: "ID is required" });
    }

    const sqlQuery = `DELETE FROM programming_languages WHERE language_id = $1;`;

    const result = await pool.query(sqlQuery, [id]);

    if (result.rowCount && result.rowCount > 0) {
      console.log(result.rowCount);
      return res.status(200).send("Language deleted successfully");
    } else {
      return res.status(404).send("Programming language not found");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export {
  addLanguage,
  getListLanguages,
  getLanguageById,
  updateNameLanguage,
  deleteLanguage,
};
