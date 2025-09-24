import { Request, Response } from "express";
import { pool } from "../db";

type Course_difficulty =
  | "Beginner"
  | "Easy"
  | "Intermediate"
  | "Advanced"
  | "Expert";

interface ValuesCreateCourse {
  title: string;
  description?: string;
  difficulty: Course_difficulty;
  price: number;
  language_id: number;
}

const courseDifficulty: Course_difficulty[] = [
  "Beginner",
  "Easy",
  "Intermediate",
  "Advanced",
  "Expert",
];

const createCourse = async (req: Request, res: Response) => {
  const { title, description, difficulty, price, language_id } = req.body;

  const courseData: ValuesCreateCourse = {
    title,
    description,
    difficulty,
    price,
    language_id,
  };

  try {
    for (const key in courseData) {
      if (key != "description" && !req.body[key]) {
        return res.status(400).send(`The ${key} value is required`);
      }
      if (key === "price" && typeof req.body[key] != "number") {
        return res.status(400).send(`The price must be a number`);
      }
      if (key === "language_id" && typeof req.body[key] != "number") {
        return res.status(400).send(`The language_id must be a number`);
      }
    }

    if (!courseDifficulty.includes(difficulty)) {
      return res
        .status(400)
        .send(
          `Invalid difficulty value. It must be one of: ${courseDifficulty.join(
            ", "
          )}`
        );
    }

    const sqlQuery = `
    INSERT INTO courses ( ${Object.keys(courseData)})
    VALUES (${Object.values(courseData).map(
      (_: ValuesCreateCourse, i: number) => `$${[i + 1].join(", ")} `
    )});
    `;

    const result = await pool.query(sqlQuery, Object.values(courseData));

    if (result.rowCount === 0) {
      return res.send(501).send("Something went wrong.");
    }

    return res.status(200).send("Created new course.");
  } catch (error: any) {
    // Error code foreign key constraint violation '23503'
    if (error.code === "23503") {
      return res.status(400).json({
        message: `Error: ${error.code}, Invalid language_id. The specified language does not exist.`,
      });
    }
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export { createCourse };
