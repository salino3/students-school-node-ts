import { Router } from "express";
import * as studentsControllers from "../../controllers/auth/auth.student.controllers";
import { customUpload } from "../../middlewares/multer-config";

const routerStudents = Router();

// Endpoint for creating a new student account
// The 'customUpload' middleware handles the file upload before the controller is called
routerStudents.post(
  "/register",
  customUpload("profile_pictures", "profile_picture"),
  studentsControllers.registerAccount
);

export default routerStudents;
