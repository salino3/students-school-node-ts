import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcryptjs";
import { errorImage } from "../utils/functions";

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
