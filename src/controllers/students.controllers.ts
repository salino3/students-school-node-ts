import { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcryptjs";
import { errorImage } from "../utils/functions";

//
const getStudents = async (req: Request, res: Response) => {
  try {
    const sqlQuery = `
      SELECT
        student_id,
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
const getBatchStudents = async (req: Request, res: Response) => {
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
        student_id,
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

//
const getStudentsById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const sqlQuery = `SELECT
     student_id,
        name,
        surnames,
        email,
        profile_picture,
        languages,
        nationality,
        phone_number,
        age FROM students WHERE student_id = $1 AND is_active = TRUE;`;

    const result = await pool.query(sqlQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("Student not found");
    }

    const student = result.rows[0];

    // Build the full profile picture URL if it exists
    if (student.profile_picture) {
      student.profile_picture = `${req.protocol}://${req.get(
        "host"
      )}/${student.profile_picture.replace(/\\/g, "/")}`;
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export { getStudents, getBatchStudents, getStudentsById };
