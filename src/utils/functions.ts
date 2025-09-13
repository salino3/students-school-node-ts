import fs from "fs";

export const errorImage = (profile_picture: any) => {
  if (profile_picture) {
    fs.unlink(profile_picture, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting the image:", unlinkErr);
      } else {
        console.log("The image was deleted successfully");
      }
    });
  }
};
