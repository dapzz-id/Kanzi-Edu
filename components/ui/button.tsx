import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'samurai' | 'dragon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transition-transform",
          {
            "bg-foreground text-background hover:bg-foreground/90": variant === "default",
            "border border-foreground/20 bg-transparent hover:bg-foreground/10 text-foreground": variant === "outline",
            "hover:bg-foreground/10 text-foreground": variant === "ghost",
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20": variant === "samurai",
            "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20": variant === "dragon",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
