import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

/**
 * ScrollArea — the standard scrollable container for the entire app.
 *
 * Renders a Radix overlay scrollbar (thin purple, auto-fading) instead of the
 * native scrollbar. Use this everywhere a container would normally have
 * `overflow-y-auto`.
 *
 * Height constraint is REQUIRED for scrolling to work. Pass one of:
 *   - A fixed/max height class: `className="h-64"` or `className="max-h-[80vh]"`
 *   - Flex fill: `className="flex-1"` (the component handles the rest)
 *
 * Use `viewportClassName` to add padding/layout to the inner scrolling viewport
 * instead of the outer root (e.g. `viewportClassName="p-6 space-y-4"`).
 */
interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  /** Classes applied to the inner scrollable viewport (padding, gaps, etc.) */
  viewportClassName?: string;
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, viewportClassName, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden min-h-0", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      className={cn("h-full w-full rounded-[inherit]", viewportClassName)}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-all duration-200 data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100",
      orientation === "vertical" &&
        "h-full w-[5px] border-l border-l-transparent p-0",
      orientation === "horizontal" &&
        "h-[5px] flex-col border-t border-t-transparent p-0",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-primary" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
