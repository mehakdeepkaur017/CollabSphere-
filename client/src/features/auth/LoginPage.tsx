import * as React from "react"
import { useNavigate, Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"

import { useAuthStore } from "@/store/authStore"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { Checkbox } from "@/components/ui/Checkbox"
import { Icons } from "@/components/shared/icons"

const loginSchema = z.object({
  email: z.string().regex(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [loginSuccess, setLoginSuccess] = React.useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const rememberMe = watch("rememberMe")

  const onSubmit = async (data: LoginValues) => {
    setServerError(null)
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      })
      setUser(response.data.user)
      setLoginSuccess(true)
      setTimeout(() => navigate("/app"), 600)
    } catch (error: any) {
      setServerError(error.response?.data?.error || "An unexpected error occurred.")
    }
  }

  return (
    <div className="flex flex-col space-y-8 pb-8">
      <div className="flex flex-col space-y-3 text-center lg:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome back</h1>
        <p className="text-sm text-white/60 leading-relaxed">
          Enter your email to sign in to your workspace
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

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-white/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email address
          </label>
          <Input 
            {...register("email")}
            type="email"
            placeholder="m.student@university.edu" 
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            className={`bg-black/50 hover:bg-black/50 focus-visible:bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-white/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Password
          </label>
          <PasswordInput 
            {...register("password")}
            autoComplete="current-password"
            className={`bg-black/50 hover:bg-black/50 focus-visible:bg-black/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center space-x-2 py-1">
          <Checkbox 
            id="rememberMe" 
            checked={rememberMe}
            onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
            className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
          />
          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none text-white/60 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me for 7 days
          </label>
        </div>

        <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]" isLoading={isSubmitting} isSuccess={loginSuccess}>
          Sign In
        </Button>
      </form>

      <p className="px-8 text-center text-sm text-white/60">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-purple-400 hover:text-purple-300 hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all">
          Create one now
        </Link>
      </p>
    </div>
  )
}
