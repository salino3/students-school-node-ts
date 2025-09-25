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
    if (!id) {
      return res.status(400).send("Student ID is required.");
    }

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

//
const getStudentByEmail = async (req: Request, res: Response) => {
  const { email } = req.params;

  try {
    if (!email) {
      return res.status(400).send("Valid email is required.");
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
      WHERE email = $1 AND is_active = TRUE;
    `;
    const result = await pool.query(sqlQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(404).send("Student not found.");
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

//
const updateStudent = async (req: Request, res: Response) => {
  const { student_id } = req.params;
  const { name, surnames, email, languages, nationality, phone_number, age } =
    req.body;

  let paramIndex = 1;

  try {
    // Check if the student exists and is active first
    const studentResult = await pool.query(
      "SELECT * FROM students WHERE student_id = $1 AND is_active = TRUE",
      [student_id]
    );
    if (studentResult.rows.length === 0) {
      return res.status(404).send("Student not found or is inactive.");
    }
    const student = studentResult.rows[0];

    // Validate if the email already exists for another active student
    if (email && !student.email) {
      return res.status(404).send("Student not found.");
    }

    if (
      student &&
      student?.email === email &&
      student_id != student.student_id
    ) {
      errorImage(req.file ? req.file.path : null);
      return res.status(400).send({ message: "Email is already in use." });
    }

    // Build the updates object and values array dynamically based on changes
    const updates: { [key: string]: any } = {};
    const values: any[] = [];

    if (name !== undefined && name !== student.name) {
      updates.name = name;
      values.push(name);
    }
    if (surnames !== undefined && surnames !== student.surnames) {
      updates.surnames = surnames;
      values.push(surnames);
    }
    if (email !== undefined && email !== student.email) {
      updates.email = email;
      values.push(email);
    }
    if (languages !== undefined && languages !== student.languages) {
      updates.languages = languages;
      values.push(languages);
    }
    if (nationality !== undefined && nationality !== student.nationality) {
      updates.nationality = nationality;
      values.push(nationality);
    }
    if (phone_number !== undefined && phone_number !== student.phone_number) {
      updates.phone_number = phone_number;
      values.push(phone_number);
    }
    if (age !== undefined && age !== student.age) {
      updates.age = age;
      values.push(age);
    }

    // Handle the profile picture upload
    if (req.file) {
      const newProfilePicturePath = req.file.path.replace(/\\/g, "/");
      if (newProfilePicturePath !== student.profile_picture) {
        updates.profile_picture = newProfilePicturePath;
        values.push(newProfilePicturePath);
      }
    }

    // Check if there's anything to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).send("No valid fields provided to update.");
    }

    // Prepare the SQL query dynamically
    const updateFields = Object.keys(updates)
      .map((key) => `${key} = $${paramIndex++}`)
      .join(", ");

    // Add the ID to the end of the values array
    values.push(student_id);

    const sqlQuery = `
      UPDATE students
      SET ${updateFields}
      WHERE student_id = $${paramIndex}
      RETURNING student_id, name, surnames, email, is_active, profile_picture, languages, nationality, phone_number, age;
    `;

    const result = await pool.query(sqlQuery, values);

    const updatedStudent = result.rows[0];

    // Build the full profile picture URL if it exists
    if (updatedStudent.profile_picture) {
      updatedStudent.profile_picture = `${req.protocol}://${req.get(
        "host"
      )}/${updatedStudent.profile_picture.replace(/\\/g, "/")}`;
    }

    return res.status(200).json(updatedStudent);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

//
const updateStudentLanguages = async (req: Request, res: Response) => {
  const { student_id, newLanguages } = req.body;

  try {
    //  Validate the input
    if (typeof student_id !== "number" || !Array.isArray(newLanguages)) {
      return res
        .status(400)
        .send(
          "Invalid input: student_id must be a number and new_languages must be an array."
        );
    }

    // Validate that all language IDs are numbers and not zero
    for (const langId of newLanguages) {
      if (
        typeof langId !== "number" ||
        langId === 0 ||
        !Number.isInteger(langId)
      ) {
        return res
          .status(400)
          .send("All language IDs must be integer numbers and non-zero.");
      }
    }

    // Use a Set to ensure all language IDs are unique
    const uniqueLanguages = [...new Set(newLanguages)];

    // Perform a single database query to update the entire languages array
    const sqlQuery = `
      UPDATE students
      SET languages = $1
      WHERE student_id = $2
         AND (SELECT COUNT(*) FROM programming_languages WHERE language_id = ANY($1::int[])) = (SELECT array_length($1::int[], 1))
      ;
    `;

    const result = await pool.query(sqlQuery, [uniqueLanguages, student_id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .send("Student not found or invalid language ID provided.");
    }

    return res.status(200).send("Student languages updated successfully.");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

//
const removeStudentFromWeb = async (req: Request, res: Response) => {
  const { student_id } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE students
      SET is_active = FALSE, deactivated_at = NOW()
      WHERE student_id = $1 AND is_active = TRUE
      RETURNING student_id, is_active, deactivated_at;
      `,
      [student_id]
    );

    // If no rows were affected, the student was not found or was already inactive
    if (result.rowCount === 0) {
      return res
        .status(404)
        .send({ message: "Student not found or is already inactive." });
    }

    return res.status(200).json({
      message: "Student account successfully deactivated.",
      deactivatedStudent: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

//
const deleteStudent = async (req: Request, res: Response) => {
  const studentId = req.params.student_id;

  try {
    const result = await pool.query(
      `DELETE FROM students
      WHERE student_id = $1;`,
      [studentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).send({ message: "Student not found" });
    }

    return res.status(200).json({
      message: "Student account successfully deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export {
  getStudents,
  getBatchStudents,
  getStudentsById,
  getStudentByEmail,
  updateStudent,
  updateStudentLanguages,
  removeStudentFromWeb,
  deleteStudent,
};
