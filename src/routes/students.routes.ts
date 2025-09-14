import { Router } from "express";
import * as studentControllers from "../controllers/students.controllers";
const routerStudents = Router();

routerStudents.get("/", studentControllers.getStudents);

routerStudents.get("/batch", studentControllers.getBatchStudents);

export default routerStudents;
