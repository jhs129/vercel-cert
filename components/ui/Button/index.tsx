"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Themeable, Stylable } from "@/lib/types";

export type ButtonVariant = "primary" | "secondary";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-md font-semibold text-sm",
    "px-5 py-2.5",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "no-underline hover:no-underline",
    "cursor-pointer",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-accent text-white",
          "hover:opacity-90",
          "focus-visible:ring-accent",
        ],
        secondary: [
          "bg-transparent text-foreground",
          "border border-border",
          "hover:bg-muted/10",
          "focus-visible:ring-foreground",
        ],
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ButtonProps extends Themeable, Stylable, VariantProps<typeof buttonVariants> {
  label?: string;
  href?: string;
}

export default function Button({
  label,
  href,
  variant = "primary",
  theme = "light",
  styles,
}: ButtonProps) {
  const className = cn(
    `theme-${theme}`,
    buttonVariants({ variant }),
    styles
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <button type="button" className={className}>
      {label}
    </button>
  );
}

export { buttonVariants };
