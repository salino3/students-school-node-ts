import { Router } from "express";
import * as studentControllers from "../controllers/students.controllers";
const routerStudents = Router();

routerStudents.get("/", studentControllers.getStudents);

export default routerStudents;
