import { Request, Response } from "express";

const addCourseToStudent = async (req: Request, res: Response) => {
  try {
    return res.status(200).send("");
  } catch (error) {}
};

export { addCourseToStudent };
