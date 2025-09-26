import { Router } from "express";
import * as studentCoursesControllers from "../controllers/student-courses.controllers";
import { authenticateToken } from "../middlewares/verify-token";

const routerStudentsCourses = Router();

routerStudentsCourses.post(
  "/:student_id",
  authenticateToken("student_id", "student_id"),
  studentCoursesControllers.addCourseToStudent
);

export default routerStudentsCourses;
