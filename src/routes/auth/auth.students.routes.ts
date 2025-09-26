import { Router } from "express";
import * as studentsAuthControllers from "../../controllers/auth/auth.student.controllers";
import { customUpload } from "../../middlewares/multer-config";
import { authenticateToken } from "../../middlewares/verify-token";

const routerAuthStudents = Router();

routerAuthStudents.post(
  "/register",
  customUpload("profile_pictures", "profile_picture"),
  studentsAuthControllers.registerStudentAccount
);

routerAuthStudents.post("/login", studentsAuthControllers.loginStudentAccount);

routerAuthStudents.patch(
  "/:student_id",
  studentsAuthControllers.changePasswordStudent
);

routerAuthStudents.post(
  "/refresh_token/:student_id",
  authenticateToken(),
  studentsAuthControllers.refreshStudentSession
);

export default routerAuthStudents;
