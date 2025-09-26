import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SECRET_KEY } from "../utils/config";

interface CustomJwtPayload extends JwtPayload {
  id: string | number;
  [key: string]: any;
}

export interface CustomRequest extends Request {
  [key: string]: any;
  authId?: number;
}

export const verifyJWT = (key: string = "", bodyParam: string = "") => {
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

export const extractCodeTokenFromCookie = (
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

//
export const authenticateToken = (
  paramKey: string = "",
  decodedKey: string = ""
) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    // 1. Determinar el nombre de la cookie y extraer el token
    const endToken = req.headers["end_token"];
    if (!endToken) {
      return res.status(400).send({
        message: "Authentication failed: Cookie identifier is missing.",
      });
    }

    const cookieName = `auth_token_${(endToken as string).replace(", ", "")}`;
    const token = req.cookies[cookieName];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication failed: No token provided." });
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY as string);
      if (cookieName) {
        req.cookies.refreshToken = req.cookies[cookieName];
      } else {
        console.warn(
          "Warning: No cookie starting with 'auth_token_' was found."
        );
      }

      if (decodedKey) {
        req.authId = (decoded as any)[decodedKey];
      }

      if (paramKey) {
        const userIdFromToken = (decoded as any)[
          decodedKey ? decodedKey : paramKey
        ];
        const paramId = req.params[paramKey];
        if (paramId !== String(userIdFromToken)) {
          console.warn(
            `Authorization failure: User ${userIdFromToken} attempted to access resource for ID ${paramId}`
          );
          return res.status(403).json({
            message:
              "Forbidden: You are not authorized to access this resource.",
          });
        }
      }

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      return res
        .status(403)
        .json({ message: "Authentication failed: Invalid or expired token." });
    }
  };
};
