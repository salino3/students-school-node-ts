import { Request, Response } from "express";
import { pool } from "../db";
import { CustomRequest } from "../middlewares/verify-token";

const addCourseToStudent = async (req: CustomRequest, res: Response) => {
  const student_id = req.authId;
  const { courseId } = req.body;

  if (!courseId || typeof courseId !== "number" || courseId <= 0) {
    return res.status(400).json({
      message: "The 'course_id' is required and must be a valid ID.",
    });
  }

  if (!student_id) {
    return res.status(401).json({
      message: "Authentication failed: Student ID not found in session.",
    });
  }

  try {
    const sqlQuery = `
            INSERT INTO student_courses (student_id, course_id)
            VALUES ($1, $2);
        `;

    await pool.query(sqlQuery, [student_id, courseId]);

    return res.status(201).json({
      message: "Course enrollment successful.",
    });
  } catch (error: any) {
    // Primary Key (PK) Violation: Student is already enrolled
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ message: "The student is already enrolled in this course." });
    }

    // Foreign Key (FK) Violation: Course does not exist
    if (error.code === "23503") {
      return res.status(404).json({
        message:
          "Enrollment error: The course with the provided ID does not exist.",
      });
    }

    console.error("Error enrolling student in course:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while processing enrollment." });
  }
};

export { addCourseToStudent };
