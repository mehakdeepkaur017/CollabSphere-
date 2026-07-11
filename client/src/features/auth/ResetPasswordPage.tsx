import * as React from "react"
import { Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/Button"
import { PasswordInput } from "@/components/ui/PasswordInput"
import { Icons } from "@/components/shared/icons"

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type ResetValues = z.infer<typeof resetSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetValues) => {
    // In a real app, this would call api.post('/auth/reset-password', data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    navigate("/login")
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">New Password</label>
          <PasswordInput 
            {...register("password")}
            autoComplete="new-password"
            className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Confirm Password</label>
          <PasswordInput 
            {...register("confirmPassword")}
            autoComplete="new-password"
            className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Reset Password
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
          Back to login
        </Link>
      </div>
    </div>
  )
}
