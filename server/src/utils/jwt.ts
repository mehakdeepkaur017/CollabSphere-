import jwt from "jsonwebtoken"
import { Response } from "express"

// In a real production app, these should be securely injected via environment variables
const JWT_SECRET = process.env.JWT_SECRET || "fallback_development_jwt_secret_collabsphere_123"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_development_jwt_refresh_secret_collabsphere_456"

export interface TokenPayload {
  userId: string
  role: string
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" })
}

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" })
}

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
}

export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  // Access token cookie (Short lived)
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000, // 15 minutes
  })

  // Refresh token cookie (Long lived)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

export const clearTokenCookies = (res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  })
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  })
}
