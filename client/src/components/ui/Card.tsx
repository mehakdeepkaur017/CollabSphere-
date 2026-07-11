import * as React from "react"
import { motion, useSpring, useMotionTemplate, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  layoutId?: string;
  disableTilt?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, layoutId, disableTilt, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const isTiltEnabled = !disableTilt && !shouldReduceMotion;
    
    // Parallax & Glow effect
    const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(0, { stiffness: 300, damping: 30 });
    const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
    const rotateY = useSpring(0, { stiffness: 300, damping: 30 });
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isTiltEnabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Parallax depth
        rotateX.set((y - centerY) / -20);
        rotateY.set((x - centerX) / 20);
        
        // Glow position
        mouseX.set(x);
        mouseY.set(y);
      },
      [isTiltEnabled, mouseX, mouseY, rotateX, rotateY]
    );

    const handleMouseLeave = React.useCallback(() => {
      setIsHovered(false);
      rotateX.set(0);
      rotateY.set(0);
    }, [rotateX, rotateY]);

    const backgroundGlow = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.1), transparent 80%)`;

    return (
      <motion.div
        ref={ref}
        layoutId={layoutId}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        style={{
          rotateX: isTiltEnabled ? rotateX : 0,
          rotateY: isTiltEnabled ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative rounded-2xl border border-white/10 bg-card text-card-foreground shadow-[var(--shadow-layered)] hover:shadow-2xl transition-shadow duration-500 group",
          className
        )}
        {...(props as any)}
      >
        {/* Animated Border Glow */}
        {isTiltEnabled && (
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: backgroundGlow }}
          />
        )}
        
        {/* Soft internal gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none rounded-2xl" />
        
        {/* Content wrapper with transform depth */}
        <div 
          className="relative z-10 w-full h-full"
          style={{ transform: isTiltEnabled && isHovered ? "translateZ(20px)" : "none", transition: "transform 0.3s ease-out" }}
        >
          {children}
        </div>
      </motion.div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
