import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export interface JwtPayload {
  userId: string;
  organizationId: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
