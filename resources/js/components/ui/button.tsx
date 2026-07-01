import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[0.6rem] text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-out outline-none focus-visible:border-ring focus-visible:ring-[4px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_4px_14px_oklch(0.65_0.18_233.78/0.4)] hover:bg-primary/90 hover:shadow-[0_6px_20px_oklch(0.65_0.18_233.78/0.6)] hover:-translate-y-[1px]",
        destructive:
          "bg-destructive text-white shadow-[0_4px_14px_oklch(0.57_0.24_27/0.4)] hover:bg-destructive/90 hover:shadow-[0_6px_20px_oklch(0.57_0.24_27/0.6)] focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 hover:-translate-y-[1px]",
        outline:
          "border border-border/80 bg-background shadow-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-primary/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-[0_2px_10px_oklch(0.65_0.18_233.78/0.1)] dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-md px-4 has-[>svg]:px-3",
        lg: "h-11 rounded-lg px-8 has-[>svg]:px-5",
        icon: "size-10",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-md",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
