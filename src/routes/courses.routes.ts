import { Router } from "express";
import * as coursesControllers from "../controllers/courses.controllers";

const routerCourses = Router();

routerCourses.post("/", coursesControllers.createCourse);

export default routerCourses;
