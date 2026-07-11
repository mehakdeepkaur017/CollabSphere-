import * as React from "react"
import { Link } from "react-router"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/Button"
import { Icons } from "@/components/shared/icons"

export function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = React.useState(true)
  const [isSuccess, setIsSuccess] = React.useState(false)

  React.useEffect(() => {
    const verify = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSuccess(true)
      setIsVerifying(false)
    }
    verify()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isVerifying ? (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icons.spinner className="h-10 w-10 animate-spin" />
          </div>
        ) : isSuccess ? (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Icons.check className="h-10 w-10" />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Icons.close className="h-10 w-10" />
          </div>
        )}
      </motion.div>

      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {isVerifying ? "Verifying email..." : isSuccess ? "Email Verified!" : "Verification Failed"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          {isVerifying 
            ? "Please wait while we verify your email address. This should only take a moment." 
            : isSuccess 
            ? "Thank you for verifying your email address. Your account is now fully activated."
            : "The verification link is invalid or has expired. Please request a new one."}
        </p>
      </div>

      {!isVerifying && (
        <Button asChild className="w-full max-w-xs mt-4">
          <Link to={isSuccess ? "/" : "/login"}>
            {isSuccess ? "Go to Dashboard" : "Back to Login"}
          </Link>
        </Button>
      )}
    </div>
  )
}
