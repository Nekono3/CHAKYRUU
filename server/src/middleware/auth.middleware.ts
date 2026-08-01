import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Ensures the authenticated user belongs to the organization that owns the
// resource identified by `getOrganizationId`. Must run after requireAuth.
export function requireOrganizationAccess(
  getOrganizationId: (req: Request) => string | undefined
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resourceOrgId = getOrganizationId(req);
    if (!resourceOrgId || resourceOrgId !== req.user?.organizationId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
