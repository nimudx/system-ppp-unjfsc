import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 hover:scale-105 overflow-hidden backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[0_2px_10px_oklch(0.65_0.18_233.78/0.3)] hover:bg-primary/90 hover:shadow-[0_4px_12px_oklch(0.65_0.18_233.78/0.5)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-sm",
        destructive:
          "border-transparent bg-destructive text-white shadow-[0_2px_10px_oklch(0.57_0.24_27/0.3)] hover:bg-destructive/90 hover:shadow-[0_4px_12px_oklch(0.57_0.24_27/0.5)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground border-border/80 hover:bg-accent hover:border-primary/50 hover:text-accent-foreground hover:shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
