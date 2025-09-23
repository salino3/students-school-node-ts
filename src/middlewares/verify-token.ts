import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SECRET_KEY } from "../utils/config";

interface CustomJwtPayload extends JwtPayload {
  id: string | number;
  [key: string]: any;
}

interface CustomRequest extends Request {
  [key: string]: any;
}

export const verifyJWT = (key = "", bodyParam = "") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const endToken = req.headers["end_token"];
    if (!endToken) {
      return res
        .status(400)
        .send({ message: "Numbers (cookie identifier) is missing." });
    }

    // const cookieName = `auth_token_${endToken}`;
    const cookieName = `auth_token_${(endToken as string).replace(", ", "")}`;
    const cookieValue = req.cookies[cookieName];
    if (!cookieValue) {
      return res.status(400).send({ message: `Cookie end code is missing.` });
    }

    try {
      const decoded = jwt.verify(
        cookieValue,
        SECRET_KEY as string
      ) as CustomJwtPayload;
      if (key) {
        // Verification IDs
        const paramsId = req.params[key];

        if (decoded[key] != paramsId) {
          return res.status(401).send({ message: "Unauthorized." });
        }
        (req as CustomRequest)[key] = decoded[key];
        next();
      } else if (bodyParam) {
        const paramsBody = req.body[bodyParam];
        if (decoded.id != paramsBody) {
          return res.status(401).send({ message: "Unauthorized." });
        }
        next();
      } else {
        if (decoded) {
          const userId = req.params.userId;
          const comapanyId = req.params.comapanyId;
          if (userId == decoded?.id || comapanyId == decoded?.id) {
            next();
          } else {
            return res
              .status(403)
              .send({ message: "Forbidden: Invalid token." });
          }
          //
        } else {
          return res.status(403).send({ message: "Forbidden: Invalid token." });
        }
      }
    } catch (error) {
      return res.status(403).send({ message: "Forbidden: Invalid token." });
    }
  };
};

export const extractTokenFromCookie = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Find the cookie that starts with "auth_token_".
  const endToken = req.headers["end_token"];
  if (!endToken) {
    return res
      .status(400)
      .send({ message: "Numbers (cookie identifier) is missing." });
  }

  const cookieName = `auth_token_${(endToken as string).replace(", ", "")}`;

  if (cookieName) {
    req.cookies.refreshToken = req.cookies[cookieName];
  } else {
    console.warn("Warning: No cookie starting with 'auth_token_' was found.");
  }

  next();
};
