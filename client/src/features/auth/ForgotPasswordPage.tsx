import * as React from "react"
import { Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Icons } from "@/components/shared/icons"

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotValues = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = React.useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotValues) => {
    // In a real app, this would call api.post('/auth/forgot-password', data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSuccess(true)
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email address</label>
              <Input 
                {...register("email")}
                type="email"
                placeholder="m.student@university.edu" 
                autoComplete="email"
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send Reset Link
            </Button>
          </motion.form>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <Icons.check className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Check your inbox</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to your email address.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
          Back to login
        </Link>
      </div>
    </div>
  )
}
