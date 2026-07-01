import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-border/50 file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary/30 selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-[0.6rem] border bg-input/20 px-4 py-2 text-base shadow-sm backdrop-blur-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring/80 focus-visible:ring-[4px] focus-visible:ring-ring/20 focus-visible:bg-input/40 focus-visible:shadow-[0_0_15px_oklch(0.65_0.18_233.78/0.15)]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:border-border hover:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

export { Input }
