import { Router } from "express";
import * as studentCoursesControllers from "../controllers/student-courses.controllers";

const routerStudentsCourses = Router();

routerStudentsCourses.post("/", studentCoursesControllers.addCourseToStudent);

export default routerStudentsCourses;
