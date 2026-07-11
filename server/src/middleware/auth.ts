import { Request, Response, NextFunction } from "express"
import { verifyAccessToken, TokenPayload } from "../utils/jwt"

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check cookies first, fallback to Authorization header
    let token = req.cookies.accessToken

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const payload = verifyAccessToken(token)
    req.user = payload
    
    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}
