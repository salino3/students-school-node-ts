import { Request, Response } from "express";
import { pool } from "../../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorImage } from "../../utils/functions";
import { SECRET_KEY } from "../../utils/config";

// This is the controller to handle new student registrations.
const registerStudentAccount = async (req: Request, res: Response) => {
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
    // Basic server-side validation for all required fields
    const requiredFields = [
      "name",
      "surnames",
      "email",
      "password",
      "age",
      "passwordConfirm",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        errorImage(profile_picture);
        return res.status(400).send(`Error: The field '${field}' is required.`);
      }
    }

    // Password validation
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

//
const loginStudentAccount = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  if (!SECRET_KEY) {
    return res
      .status(500)
      .send("Server configuration error: 'SECRET KEY' not defined.");
  }

  try {
    const sqlQuery = `
      SELECT
        student_id,
        name,
        email,
        password,
        profile_picture,
        languages,
        nationality,
        phone_number,
        is_active
      FROM students
      WHERE email = $1 AND is_active = TRUE;
    `;

    const result = await pool.query(sqlQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(404).send("Email not found");
    }

    const student = result.rows[0];
    const isPasswordValid = bcrypt.compareSync(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).send("Password or email invalid");
    }

    const { password: psw, ...account } = student;
    if (account.profile_picture) {
      account.profile_picture = `${req.protocol}://${req.get(
        "host"
      )}/${account.profile_picture.replace(/\\/g, "/")}`;
    }

    // Generate token
    const token = jwt.sign(account, SECRET_KEY, {
      expiresIn: "1h",
    });

    const generateRandomNumber = () => {
      return Math.floor(1000 + Math.random() * 9000);
    };

    res.cookie("auth_token_" + generateRandomNumber(), token, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      expires: new Date(Date.now() + 3600 * 1000),
    });

    return res.json(account);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error during login");
  }
};

//
const changePasswordStudent = async (req: Request, res: Response) => {
  const studentId = req.params.student_id;
  const { password, newPassword } = req.body;

  try {
    if (!newPassword || !password) {
      return res
        .status(400)
        .send({ message: "Both old password and new passwords are required." });
    }

    if (password === newPassword) {
      return res.status(400).send({
        message: "New password should be different than old password.",
      });
    }

    // Get the student to compare the current password
    const studentResult = await pool.query(
      "SELECT password FROM students WHERE student_id = $1 AND is_active = TRUE",
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).send("Student not found or is inactive.");
    }

    const student = studentResult.rows[0];

    // Compare the old password with the hashed password from the database
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).send("Incorrect old password.");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const sqlQuery = `
      UPDATE students
      SET password = $1
      WHERE student_id = $2
      RETURNING student_id;
    `;
    await pool.query(sqlQuery, [hashedPassword, studentId]);

    return res.status(200).send({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export { registerStudentAccount, loginStudentAccount, changePasswordStudent };
