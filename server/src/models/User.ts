import mongoose, { Document, Schema } from "mongoose"
import bcrypt from "bcrypt"

export enum UserRole {
  STUDENT = "student",
  TEAM_LEADER = "team_leader",
}

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: UserRole
  avatar?: string
  verified: boolean
  refreshToken?: string
  notificationPreferences?: {
    [module: string]: {
      desktop: boolean;
      inApp: boolean;
      email: boolean;
      sound: boolean;
    }
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    avatar: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    notificationPreferences: {
      type: Schema.Types.Mixed,
      default: {} // We'll handle defaults in the service layer if needed
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.password
        delete ret.refreshToken
        delete ret.__v
        return ret
      }
    }
  }
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>("User", userSchema)
