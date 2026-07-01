import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Validates the Bearer JWT in the Authorization header.
// Attaches `userId` to the request so route handlers can use it.
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = decoded.userId;
    next(); // token is valid — continue to the route handler
  } catch {
    // Token is expired or tampered — frontend will auto-logout on 401
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};