import { Router } from "express";
import * as studentControllers from "../controllers/students.controllers";
import { customUpload } from "../middlewares/multer-config";

const routerStudents = Router();

routerStudents.get("/", studentControllers.getStudents);

routerStudents.get("/batch", studentControllers.getBatchStudents);

routerStudents.get("/:id", studentControllers.getStudentsById);

routerStudents.get("/email/:email", studentControllers?.getStudentByEmail);

routerStudents.put(
  "/:student_id",
  customUpload("profile_pictures", "profile_picture"),
  studentControllers?.updateStudent
);

routerStudents.patch("/:student_id", studentControllers.changePasswordStudent);

export default routerStudents;
