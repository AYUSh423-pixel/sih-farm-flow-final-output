"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-sm",
        secondary: "bg-[var(--sage)] text-[var(--heading)] hover:bg-[#d7eadc]",
        outline: "border border-[var(--line)] bg-white text-[var(--heading)] hover:bg-[var(--sage)]",
        ghost: "text-[var(--heading)] hover:bg-[var(--sage)]",
        danger: "bg-[#b42318] text-white hover:bg-[#912018]",
      },
      size: {
        default: "h-12 px-5",
        lg: "h-14 px-6 text-lg",
        sm: "h-9 px-3 text-sm",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
