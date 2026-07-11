import * as React from "react"
import { motion, useSpring, useTransform, useInView } from "framer-motion"

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

const fontSize = 30;
const padding = 15;
const height = fontSize + padding;

function Digit({ place, value }: { place: number; value: number }) {
  const roundedValue = Math.floor(value / place) % 10;
  
  // Use framer motion spring to smoothly animate to the new digit
  const animatedValue = useSpring(roundedValue, {
    stiffness: 200,
    damping: 30,
    mass: 1,
  });

  React.useEffect(() => {
    animatedValue.set(roundedValue);
  }, [animatedValue, roundedValue]);

  // Transform the value into a Y translation
  const y = useTransform(animatedValue, (latest) => {
    return -(latest * height);
  });

  return (
    <div style={{ height }} className="relative w-[1ch] overflow-hidden tabular-nums leading-none">
      <motion.div style={{ y }} className="absolute inset-x-0 top-0 flex flex-col items-center">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center justify-center" style={{ height }}>
            {i}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  // Only start counting when in view
  const displayValue = isInView ? value : 0;
  const numString = displayValue.toString();
  
  return (
    <div ref={ref} className={`flex items-center text-4xl font-bold text-primary tracking-tighter ${className}`}>
      {numString.split("").map((digit, i) => {
        if (isNaN(parseInt(digit))) {
          // If it's a comma or decimal point
          return (
            <span key={`${i}-${digit}`} className="tabular-nums" style={{ height }}>
              {digit}
            </span>
          );
        }
        
        // Calculate the place value (1, 10, 100, etc)
        const place = Math.pow(10, numString.length - 1 - i);
        return <Digit key={place} place={place} value={displayValue} />;
      })}
    </div>
  )
}
