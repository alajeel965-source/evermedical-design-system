import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-medical-sm text-medical-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medical",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-soft",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Medical-specific variants
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medical hover:shadow-medical-lg transform hover:-translate-y-0.5 text-medical-base font-semibold",
        "hero-secondary": "bg-background text-primary border-2 border-primary hover:bg-primary hover:text-primary-foreground shadow-medical hover:shadow-medical-lg transform hover:-translate-y-0.5 text-medical-base font-semibold",
        "hero-ghost": "bg-background/80 text-heading hover:bg-background hover:text-primary shadow-soft hover:shadow-medical text-medical-base font-medium",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-soft",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-soft",
      },
      size: {
        default: "h-10 px-lg py-sm",
        sm: "h-8 px-md py-xs text-medical-sm",
        lg: "h-12 px-xl py-md text-medical-base",
        xl: "h-14 px-2xl py-lg text-medical-lg",
        icon: "h-10 w-10",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
