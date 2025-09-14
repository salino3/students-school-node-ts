import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcryptjs";
import { errorImage } from "../utils/functions";

//
export const getStudents = async (req: Request, res: Response) => {
  try {
    const sqlQuery = `
      SELECT
        user_id,
        name,
        surnames,
        email,
        profile_picture,
        languages,
        nationality,
        phone_number,
        age
      FROM students
      WHERE is_active = TRUE;
    `;

    const result = await pool.query(sqlQuery);

    if (result?.rowCount === 0) {
      return res.status(404).send("No users found.");
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

//
export const getBatchStudents = async (req: Request, res: Response) => {
  const { limit = 5, offset = 0 } = req.query;

  try {
    const parsedLimit: number = parseInt(String(limit), 10);
    const parsedOffset: number = parseInt(String(offset), 10);

    if (
      isNaN(parsedLimit) ||
      isNaN(parsedOffset) ||
      parsedLimit <= 0 ||
      parsedOffset < 0
    ) {
      return res.status(400).send("Invalid limit or offset values.");
    }

    if (parsedLimit > 20) {
      return res.status(400).send("Limit cannot be greater than 20.");
    }

    const sqlQuery = `
     SELECT
        user_id,
        name,
        surnames,
        email,
        profile_picture,
        languages,
        nationality,
        phone_number,
        age
      FROM students
      WHERE is_active = TRUE  LIMIT $1 OFFSET $2;`;

    const result = await pool.query(sqlQuery, [parsedLimit, parsedOffset]);

    if (result.rows.length === 0) {
      return res.status(404).send("No accounts found.");
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};
