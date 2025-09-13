import { Request, Response } from "express";
import { pool } from "../../db";
import bcrypt from "bcryptjs";
import { errorImage } from "../../utils/functions";

// This is the controller to handle new student registrations.
export const registerAccount = async (req: Request, res: Response) => {
  // Extract data from the request body and the uploaded file
  const {
    name,
    surnames,
    email,
    password,
    age,
    nationality,
    phone_number,
    passwordConfirm,
  } = req.body;

  // The 'path' property will exist if a file was uploaded
  const profile_picture = req.file?.path || null;

  try {
    // Basic server-side validation
    if (password !== passwordConfirm) {
      errorImage(profile_picture);
      return res.status(400).send("Password and confirm password do not match");
    }

    if (password?.length < 6) {
      errorImage(profile_picture);
      return res
        .status(400)
        .send("Password should be at least 6 characters long");
    }

    // Hash the password for security
    const hashedPassword = bcrypt.hashSync(password, 10);

    // SQL query to insert a new student into the 'students' table
    const sqlQuery = `
      INSERT INTO students (
         profile_picture,
        name,
        surnames,
        email,
        password,
        age,
        nationality,
        phone_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;`;

    // The query values are passed as an array to PostgreSQL
    const values = [
      profile_picture,
      name,
      surnames,
      email,
      hashedPassword,
      age,
      nationality,
      phone_number,
    ];

    await pool.query(sqlQuery, values);

    // Send a success response
    return res.status(201).send("Account registered successfully");
  } catch (err: any) {
    // If the image was uploaded but an error occurred in the DB, delete the image
    if (profile_picture) {
      errorImage(profile_picture);
    }

    // Check for specific database errors to provide a more descriptive message
    if (err.constraint === "chk_age_adult") {
      return res
        .status(400)
        .send("You must be at least 18 years old to register.");
    }
    if (err.code === "23505") {
      // PostgreSQL error code for unique constraint violation
      return res.status(400).send("This email is already in use by a student.");
    }

    // Log the error and send a generic server error response
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};
