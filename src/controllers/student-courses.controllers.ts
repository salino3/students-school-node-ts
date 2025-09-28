import { Request, Response } from "express";
import { pool } from "../db";
import { CustomRequest } from "../middlewares/verify-token";

//
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

//
const getCoursesStudent = async (req: CustomRequest, res: Response) => {
  const student_id = req.authId;

  if (!student_id) {
    return res
      .status(401)
      .json({ message: "Authentication required to view courses." });
  }

  try {
    const sqlQuery = `
            SELECT 
                courses.course_id,
                courses.title,
                courses.description,
                courses.difficulty,
                courses.price,
                courses.language_id,
                programming_languages.name AS language_name,
                sc.enrollment_date
            FROM student_courses sc
            INNER JOIN courses ON sc.course_id = courses.course_id
            INNER JOIN programming_languages   ON courses.language_id = programming_languages.language_id
            WHERE sc.student_id = $1
            ORDER BY sc.enrollment_date DESC;
        `;

    const result = await pool.query(sqlQuery, [student_id]);

    return res.status(200).json({
      courses: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving student courses:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while retrieving courses." });
  }
};

//
const deleteAllCoursesStudent = async (req: CustomRequest, res: Response) => {
  const student_id = req.authId;

  if (!student_id) {
    return res
      .status(401)
      .json({ message: "Authentication required to clear enrollments." });
  }

  try {
    const sqlQuery = `
      DELETE FROM student_courses
      WHERE student_id = $1;
    `;

    const result = await pool.query(sqlQuery, [student_id]);

    const message =
      (result.rowCount ?? 0) === 0
        ? "No active enrollments found to remove."
        : `Successfully removed ${result.rowCount} course enrollments.`;

    return res.status(200).json({
      message: message,
      courses_removed_count: result.rowCount,
    });
  } catch (error) {
    console.error("Error deleting all student course enrollments:", error);
    return res.status(500).json({
      message: "Internal server error while clearing enrollments.",
    });
  }
};

//
const deleteCourseStudent = async (req: CustomRequest, res: Response) => {
  const student_id = req.authId;

  const { course_id } = req.params;

  if (!student_id) {
    return res
      .status(401)
      .json({ message: "Authentication required to remove courses." });
  }

  if (!course_id || isNaN(Number(course_id)) || Number(course_id) <= 0) {
    return res.status(400).json({
      message: "A valid course ID is required in the URL parameters.",
    });
  }

  try {
    const sqlQuery = `
      WITH deleted AS (
        DELETE FROM student_courses
        WHERE student_id = $1 AND course_id = $2
        RETURNING course_id
      )
      SELECT 
        CASE
          WHEN EXISTS (SELECT 1 FROM deleted) THEN 'deleted'
          WHEN EXISTS (SELECT 1 FROM courses WHERE course_id = $2) THEN 'not_enrolled'
          ELSE 'no_course'
        END AS status,
        $2::int AS course_id;
    `;

    const result = await pool.query(sqlQuery, [student_id, Number(course_id)]);
    const { status, course_id: returnedCourseId } = result.rows[0];

    if (status === "deleted") {
      return res.status(200).json({
        message: "Course successfully removed from student enrollment.",
        course_id: returnedCourseId,
      });
    } else if (status === "not_enrolled") {
      return res.status(404).json({
        message:
          "Enrollment not found. The student is not enrolled in this course.",
        course_id: returnedCourseId,
      });
    } else if (status === "no_course") {
      return res.status(404).json({
        message: `The course with ID ${course_id} does not exist.`,
      });
    }
  } catch (error) {
    console.error("Error removing course enrollment:", error);
    return res.status(500).json({
      message: "Internal server error while processing disenrollment.",
    });
  }
};

export {
  addCourseToStudent,
  getCoursesStudent,
  deleteAllCoursesStudent,
  deleteCourseStudent,
};
