import * as React from "react"
import { useNavigate, Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"

import { useAuthStore } from "@/store/authStore"
import type { UserRole } from "@/store/authStore"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { Checkbox } from "@/components/ui/Checkbox"
import { Icons } from "@/components/shared/icons"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["student", "team_leader"] as const),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = React.useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    },
  })

  const terms = watch("terms")
  const role = watch("role")
  const password = watch("password")

  const calculateStrength = (pass: string) => {
    let score = 0
    if (!pass) return 0
    if (pass.length >= 8) score += 25
    if (pass.match(/[A-Z]/)) score += 25
    if (pass.match(/[0-9]/)) score += 25
    if (pass.match(/[^A-Za-z0-9]/)) score += 25
    return score
  }
  const strength = calculateStrength(password)

  const onSubmit = async (data: RegisterValues) => {
    setServerError(null)
    try {
      const response = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      setUser(response.data.user)
      setRegisterSuccess(true)
      setTimeout(() => navigate("/app"), 600)
    } catch (error: any) {
      setServerError(error.response?.data?.error || "Registration failed.")
    }
  }

  return (
    <div className="flex flex-col space-y-8 pb-8">
      <div className="flex flex-col space-y-3 text-center lg:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Create an account</h1>
        <p className="text-sm text-white/60 leading-relaxed">
          Join CollabSphere and start organizing your academic projects seamlessly.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AnimatePresence>
          {serverError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
            >
              {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Full Name
            </label>
            <Input 
              {...register("name")}
              placeholder="Ada Lovelace" 
              autoComplete="name"
              className={`bg-black/50 hover:bg-black/50 focus-visible:bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white/90">Email address</label>
            <Input 
              {...register("email")}
              type="email"
              placeholder="ada@university.edu" 
              autoComplete="email"
              className={`bg-black/50 hover:bg-black/50 focus-visible:bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-white/90">Password</label>
              <PasswordInput 
                {...register("password")}
                autoComplete="new-password"
                className={`bg-black/50 hover:bg-black/50 focus-visible:bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 flex gap-1">
                  <div className={`h-1 w-1/4 rounded-full transition-colors ${strength >= 25 ? (strength === 100 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-white/10'}`} />
                  <div className={`h-1 w-1/4 rounded-full transition-colors ${strength >= 50 ? (strength === 100 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-white/10'}`} />
                  <div className={`h-1 w-1/4 rounded-full transition-colors ${strength >= 75 ? (strength === 100 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-white/10'}`} />
                  <div className={`h-1 w-1/4 rounded-full transition-colors ${strength === 100 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-white/90">Confirm Password</label>
              <PasswordInput 
                {...register("confirmPassword")}
                autoComplete="new-password"
                className={`bg-black/50 hover:bg-black/50 focus-visible:bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </div>


        <div className="flex items-start space-x-2 py-4">
          <Checkbox 
            id="terms" 
            checked={!!terms}
            onCheckedChange={(checked) => setValue("terms", checked as boolean)}
            className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 mt-0.5"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none text-white/60 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the CollabSphere Terms of Service and Privacy Policy.
            </label>
            {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}
          </div>
        </div>

        <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]" isLoading={isSubmitting} isSuccess={registerSuccess}>
          Create Account
        </Button>
      </form>

      <p className="px-8 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all">
          Sign in
        </Link>
      </p>
    </div>
  )
}
