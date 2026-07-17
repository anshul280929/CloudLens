import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * CloudLens Design System — Card
 *
 * DESIGN.md elevation system: surface-lift, not shadow-driven.
 * Level 1: surface-1 + hairline border (default cards)
 * Level 2: surface-2 + hairline border (featured/hovered)
 * Level 3: product-chromatic bg (product identity)
 */
const cardVariants = cva(
  [
    "rounded-lg border border-[rgba(178,182,189,0.1)]",
    "transition-[border-color,background-color] duration-200 ease-out",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-surface-1",
        featured: "bg-surface-2 border-hairline",
        interactive:
          "bg-surface-1 cursor-pointer hover:border-hairline hover:bg-surface-2",
        "product-terraform": "bg-product-terraform text-ink",
        "product-vault": "bg-product-vault text-inverse-ink",
        "product-waypoint": "bg-product-waypoint text-inverse-ink",
        "product-consul": "bg-product-consul text-ink",
        "product-nomad": "bg-product-nomad text-inverse-ink",
        "product-vagrant": "bg-product-vagrant text-ink",
        "product-boundary": "bg-product-boundary text-ink",
      },
      padding: {
        default: "p-6",
        compact: "p-4",
        spacious: "p-8",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

/* ── Card Sub-components ── */

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn(
      "flex items-start justify-between mb-3",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="card-title"
    className={cn(
      "text-card-title text-ink",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn("text-body text-ink-muted", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn("", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn(
      "flex items-center justify-between pt-3 mt-3.5 border-t border-[rgba(178,182,189,0.1)]",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  cardVariants,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
