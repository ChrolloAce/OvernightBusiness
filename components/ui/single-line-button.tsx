import * as React from "react"
import { Button, ButtonProps } from "./button"
import { cn } from "@/lib/utils"

interface SingleLineButtonProps extends ButtonProps {
  icon?: React.ReactNode
  children: React.ReactNode
}

/**
 * A button that ensures text stays on a single line and never wraps
 */
export const SingleLineButton = React.forwardRef<
  HTMLButtonElement,
  SingleLineButtonProps
>(({ className, icon, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "min-w-fit flex-shrink-0 gap-2",
        "whitespace-nowrap overflow-hidden text-ellipsis",
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="overflow-hidden text-ellipsis min-w-0">
        {children}
      </span>
    </Button>
  )
})

SingleLineButton.displayName = "SingleLineButton"

/**
 * Container for equal-width buttons that prevent text wrapping
 */
export const EqualWidthButtonGroup = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => {
  return (
    <div className={cn("flex gap-3 w-full", className)}>
      {React.Children.map(children, (child, index) => (
        <div key={index} className="flex-1 min-w-0">
          {child}
        </div>
      ))}
    </div>
  )
}

/**
 * Pill-style button for CTAs that need consistent sizing
 */
export const PillButton = React.forwardRef<
  HTMLButtonElement,
  SingleLineButtonProps
>(({ className, icon, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "min-w-[120px] h-11 px-4 rounded-full",
        "flex items-center justify-center gap-2",
        "whitespace-nowrap overflow-hidden text-ellipsis",
        "font-medium text-sm",
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="overflow-hidden text-ellipsis">
        {children}
      </span>
    </Button>
  )
})

PillButton.displayName = "PillButton"
