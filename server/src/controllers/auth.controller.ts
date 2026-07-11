import { Request, Response } from "express"
import { z } from "zod"
import { User, UserRole } from "../models/User"
import { 
  generateAccessToken, 
  generateRefreshToken, 
  setTokenCookies, 
  clearTokenCookies, 
  verifyRefreshToken
} from "../utils/jwt"

// Zod schemas for validation
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT)
})

const loginSchema = z.object({
  email: z.string().regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body)
    
    const existingUser = await User.findOne({ email: validatedData.email })
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" })
    }

    const user = await User.create(validatedData)
    
    // Generate tokens
    const tokenPayload = { userId: user.id, role: user.role }
    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)
    
    // Save refresh token to db
    user.refreshToken = refreshToken
    await user.save()

    setTokenCookies(res, accessToken, refreshToken)
    
    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    })
  } catch (error) {
    console.error("Register Error:", error)
    if (error instanceof z.ZodError || (error as any).name === 'ZodError') {
      return res.status(400).json({ error: (error as any).errors[0].message })
    }
    if ((error as any).name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((val: any) => val.message);
      return res.status(400).json({ error: messages[0] });
    }
    return res.status(500).json({ error: (error as Error).message || "Internal server error" })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, role: user.role }
    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)
    
    // Save refresh token to db
    user.refreshToken = refreshToken
    await user.save()

    setTokenCookies(res, accessToken, refreshToken)

    // Save session
    try {
      const { Session } = await import("../models/Session");
      await Session.create({
        user: user._id,
        token: accessToken,
        device: req.headers["user-agent"] || "Unknown Device",
        os: "Detected from User-Agent",
        browser: "Detected from User-Agent",
        ipAddress: req.ip || req.connection.remoteAddress || "Unknown IP",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins (access token lifespan)
      });
    } catch (err) {
      console.error("Failed to create session record", err);
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error("Login Error:", error);
    if (error instanceof z.ZodError || (error as any).name === 'ZodError') {
      return res.status(400).json({ error: (error as any).errors[0].message })
    }
    return res.status(500).json({ error: (error as Error).message || "Internal server error" })
  }
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken
    
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" })
    }

    const payload = verifyRefreshToken(refreshToken)
    
    const user = await User.findById(payload.userId).select("+refreshToken")
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" })
    }

    const tokenPayload = { userId: user.id, role: user.role }
    const newAccessToken = generateAccessToken(tokenPayload)
    const newRefreshToken = generateRefreshToken(tokenPayload)
    
    user.refreshToken = newRefreshToken
    await user.save()

    setTokenCookies(res, newAccessToken, newRefreshToken)

    return res.status(200).json({
      message: "Token refreshed successfully"
    })
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired refresh token" })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    if (req.user?.userId) {
      await User.findByIdAndUpdate(req.user.userId, { $unset: { refreshToken: 1 } })
    }
    clearTokenCookies(res)
    return res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        avatar: user.avatar
      }
    })
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" })
  }
}
