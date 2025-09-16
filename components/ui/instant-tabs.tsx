"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InstantTabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface InstantTabsListProps {
  children: React.ReactNode
  className?: string
}

interface InstantTabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface InstantTabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const InstantTabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

/**
 * Tabs component with instant transitions (no animations)
 */
export function InstantTabs({ value, onValueChange, children, className }: InstantTabsProps) {
  return (
    <InstantTabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </InstantTabsContext.Provider>
  )
}

export function InstantTabsList({ children, className }: InstantTabsListProps) {
  return (
    <div 
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full",
        className
      )}
    >
      {children}
    </div>
  )
}

export function InstantTabsTrigger({ value, children, className }: InstantTabsTriggerProps) {
  const context = React.useContext(InstantTabsContext)
  if (!context) throw new Error("InstantTabsTrigger must be used within InstantTabs")
  
  const { value: selectedValue, onValueChange } = context
  const isActive = selectedValue === value
  
  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
        "transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "overflow-hidden text-ellipsis flex-1",
        isActive 
          ? "bg-background text-foreground shadow-sm" 
          : "hover:bg-muted-foreground/10",
        className
      )}
    >
      {children}
    </button>
  )
}

export function InstantTabsContent({ value, children, className }: InstantTabsContentProps) {
  const context = React.useContext(InstantTabsContext)
  if (!context) throw new Error("InstantTabsContent must be used within InstantTabs")
  
  const { value: selectedValue } = context
  const isActive = selectedValue === value
  
  if (!isActive) return null
  
  return (
    <div 
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  )
}
