import multer from "multer";
import path from "path";
import { Request } from "express";

// A custom upload middleware that uses Multer to handle file uploads.
// It specifies the destination and filename for the uploaded files.
export const customUpload = (route: string, prop: string) => {
  // Storage configuration to save files on disk
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // The destination directory where the images will be stored
      cb(null, `uploads/${route}/`);
    },
    filename: function (req, file, cb) {
      // To prevent filename collisions, a unique identifier is used
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
  });

  // A file filter to accept only specific image types
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Pass the error directly to the callback
      cb(
        new Error(
          "Invalid file type. Only JPG, JPEG, WEBP and PNG are allowed."
        )
      );
    }
  };

  const upload = multer({ storage, fileFilter });

  // Return the single file upload middleware
  return upload.single(prop);
};
