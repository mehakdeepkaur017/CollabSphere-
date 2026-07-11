import { Request, Response, NextFunction } from "express"
import { UserRole } from "../models/User"

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}
