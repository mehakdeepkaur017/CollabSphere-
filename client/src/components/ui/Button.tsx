import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, useSpring, useTransform, useReducedMotion } from "framer-motion"
import { Icons } from "@/components/shared/icons"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[var(--shadow-layered)] hover:shadow-[var(--shadow-layered-lg)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[var(--shadow-layered)]",
        outline: "border border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  isSuccess?: boolean
  disableMagnetic?: boolean
}

const MotionSlot = motion.create(Slot as any)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, isSuccess, disableMagnetic, children, disabled, ...props }, ref) => {
    const Comp = asChild ? MotionSlot : motion.button
    const isPrimary = variant === "default" || !variant
    const shouldReduceMotion = useReducedMotion()
    
    // Magnetic Physics
    const internalRef = React.useRef<HTMLButtonElement>(null)
    const buttonRef = (ref || internalRef) as React.MutableRefObject<HTMLButtonElement>
    
    const [isHovered, setIsHovered] = React.useState(false)
    const mouseX = useSpring(0, { stiffness: 400, damping: 25, mass: 0.5 })
    const mouseY = useSpring(0, { stiffness: 400, damping: 25, mass: 0.5 })

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (shouldReduceMotion || disableMagnetic) return;
      const { clientX, clientY } = e
      const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
      
      const x = (clientX - (left + width / 2)) * 0.2
      const y = (clientY - (top + height / 2)) * 0.2
      
      mouseX.set(x)
      mouseY.set(y)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      mouseX.set(0)
      mouseY.set(0)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), "group")}
        ref={buttonRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        style={{
          x: mouseX,
          y: mouseY,
        }}
        disabled={disabled || isLoading || isSuccess}
        {...(props as any)}
      >
        {asChild ? (
          children
        ) : (
          <>
            {/* Ripple/Glow on hover */}
            {isPrimary && (
              <motion.div 
                className="absolute inset-0 z-0 bg-white/20 blur-[10px] rounded-full pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: isHovered ? 0.5 : 0, 
                  scale: isHovered ? 1.5 : 0,
                  x: mouseX.get() * 2,
                  y: mouseY.get() * 2
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />
            )}

            <AnimatePresence mode="wait" initial={false}>
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center relative z-10"
                >
                  <Icons.spinner className="h-5 w-5 animate-spin" />
                </motion.div>
              ) : isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center justify-center relative z-10 text-emerald-400"
                >
                  <Icons.check className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="relative z-10 flex items-center justify-center w-full h-full"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
