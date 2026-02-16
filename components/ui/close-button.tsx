"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { feedbackButtonPress } from "@/lib/feedback";

/**
 * CloseButton — THE canonical close ("X") icon for the entire app.
 *
 * Every dismiss/close affordance MUST use this component.
 * No per-component overrides, no ad-hoc X icons, no exceptions.
 *
 * Spec:
 * - Icon: lucide X, h-4 w-4, stroke-width 2 (lucide default)
 * - Hit area: 28×28 (h-7 w-7) — meets 44px WCAG on mobile via padding
 * - Background: transparent → hover:bg-muted/80
 * - Opacity: 70% → hover:100%
 * - Corner radius: rounded-sm
 * - Motion: transition-all duration-200 ease-out on ALL states
 * - Focus ring: ring-2 ring-ring ring-offset-2
 * - Accessibility: sr-only "Close" label
 * - Cursor: pointer
 */

interface CloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Override the sr-only label (default: "Close") */
  label?: string;
}

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className, label = "Close", onClick, disabled, ...props }, ref) => {
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) feedbackButtonPress();
        onClick?.(e);
      },
      [disabled, onClick],
    );

    return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        // Layout
        "inline-flex items-center justify-center shrink-0",
        // Size — 28×28 hit area
        "h-7 w-7",
        // Shape
        "rounded-sm",
        // Colors & opacity
        "opacity-70 hover:opacity-100",
        "text-foreground/80 hover:text-foreground",
        "hover:bg-muted/80",
        // Motion — unified, non-negotiable
        "transition-all duration-200 ease-out",
        // Focus
        "ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // Cursor
        "cursor-pointer",
        className,
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </button>
    );
  },
);

CloseButton.displayName = "CloseButton";

export { CloseButton };
