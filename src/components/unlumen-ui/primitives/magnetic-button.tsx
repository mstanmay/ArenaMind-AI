// @ts-nocheck
"use client";

import React, { useRef } from "react";
import { m as motion, useMotionValue, useSpring } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const magneticButtonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold tracking-wider transition-colors cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90 shadow-[0_0_20px_rgba(0,229,255,0.2)]",
        secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        outline: "border border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface MagneticButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof magneticButtonVariants> {
  radius?: number;
  strength?: number;
  springOptions?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      className,
      variant,
      size,
      radius = 100,
      strength = 0.5,
      springOptions = { stiffness: 150, damping: 15, mass: 0.1 },
      children,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    
    // Position values of the pull effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    // Smooth spring physics for magnetic movement
    const springX = useSpring(x, springOptions);
    const springY = useSpring(y, springOptions);

    const handleMouseMove = (e: React.MouseEvent) => {
      const el = buttonRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;

      // Distance between cursor and button center
      const distanceX = e.clientX - elCenterX;
      const distanceY = e.clientY - elCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < radius) {
        // Proportional pull force
        const pull = 1 - distance / radius;
        x.set(distanceX * strength * pull);
        y.set(distanceY * strength * pull);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    const setRefs = (node: HTMLButtonElement) => {
      buttonRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <motion.button
        ref={setRefs}
        style={{ x: springX, y: springY }}
        className={cn(magneticButtonVariants({ variant, size, className }))}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";
export { magneticButtonVariants };
