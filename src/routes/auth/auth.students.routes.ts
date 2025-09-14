import { Router } from "express";
import * as studentsAuthControllers from "../../controllers/auth/auth.student.controllers";
import { customUpload } from "../../middlewares/multer-config";

const routerAuthStudents = Router();

routerAuthStudents.post(
  "/register",
  customUpload("profile_pictures", "profile_picture"),
  studentsAuthControllers.registerStudentAccount
);

routerAuthStudents.post("/login", studentsAuthControllers.loginStudentAccount);

export default routerAuthStudents;
