

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@chess/backend-common/config";

export async function authMiddleware(
  req: Request,
  res: any,
  next: NextFunction
) {

  const token = req.cookies.chess_authentication_token ;
  console.log("Token: ", token);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded =  jwt.verify(token, JWT_SECRET);
    console.log("Decoded: ", decoded);

    if(typeof decoded === "string") return;
    req.userId = decoded.id;
    next();
  } catch (e: any) {
    res.status(400).json({ error: "some error occurred : " + e });
  }
}
