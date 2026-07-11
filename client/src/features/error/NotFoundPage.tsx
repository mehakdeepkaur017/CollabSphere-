import { Link } from "react-router"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Icons } from "@/components/shared/icons"
import { fadeSlideUpVariants, staggerContainerVariants, staggerItemVariants } from "@/lib/motion"

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-6">
      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="flex max-w-md flex-col items-center justify-center text-center space-y-6"
      >
        <motion.div variants={staggerItemVariants} className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-indigo-500/10">
          <Icons.fileText className="h-16 w-16 text-indigo-500" />
        </motion.div>
        
        <motion.div variants={staggerItemVariants} className="space-y-3">
          <h1 className="text-6xl font-bold tracking-tighter text-foreground">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </motion.div>
        
        <motion.div variants={staggerItemVariants} className="pt-4">
          <Button asChild size="lg" className="rounded-full shadow-sm hover:shadow-md">
            <Link to="/">
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
