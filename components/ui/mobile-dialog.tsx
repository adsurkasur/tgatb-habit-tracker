import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * MobileDialogContent - Unified dialog component for desktop and mobile
 * 
 * Architecture:
 * - Overlay: bg-black/80, fade animation only
 * - Content: centered via Tailwind translate, fade+scale animation only
 * - NO slide animations on centered dialogs (incompatible with Tailwind v4 translate)
 */
const MobileDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { isKeyboardOpen, viewportHeight } = useVirtualKeyboard();
  const isMobile = useIsMobile();

  // Lock body scroll when modal is open on mobile
  React.useEffect(() => {
    // Removed body scroll lock - allow normal page scrolling
    return () => {
      // No cleanup needed
    };
  }, [isMobile]);

  // Scroll focused input into view when keyboard opens
  React.useEffect(() => {
    if (isKeyboardOpen && isMobile) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        // Delay to ensure keyboard animation completes
        setTimeout(() => {
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 300);
      }
    }
  }, [isKeyboardOpen, isMobile]);

  // Calculate responsive positioning
  // Uses Tailwind translate utilities for consistency with animation system
  const getPositioning = () => {
    if (!isMobile) {
      // Desktop: centered via Tailwind translate utilities
      return {
        className: "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
        style: {} as React.CSSProperties
      };
    }

    // Mobile: centered with responsive constraints
    if (isKeyboardOpen) {
      // When keyboard is open, position higher to stay visible
      const availableHeight = viewportHeight;
      const topPosition = Math.max(20, availableHeight * 0.1);
      
      return {
        className: "left-[50%] translate-x-[-50%]",
        style: {
          top: `${topPosition}px`,
          maxHeight: `${availableHeight * 0.8}px`,
        } as React.CSSProperties
      };
    }

    // Mobile default: centered like desktop
    return {
      className: "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
      style: {
        width: 'calc(100vw - 2rem)',
        maxWidth: '500px',
        maxHeight: '75vh',
      } as React.CSSProperties
    };
  };

  const positioning = getPositioning();

  return (
    <DialogPrimitive.Portal>
      {/* Overlay: solid bg-black/80, fade animation only, never slide */}
      <DialogPrimitive.Overlay 
        className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        style={{
          // Prevent scroll events on overlay
          touchAction: 'none',
          overscrollBehavior: 'none',
          overflow: 'hidden'
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      {/* Content: centered via Tailwind translate, fade+scale animation only */}
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // Base layout
          "fixed z-50 grid gap-4 border bg-background p-6 shadow-lg",
          // Animation: fade + scale only (no slide - incompatible with translate centering)
          "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          // Styling
          "overflow-y-auto rounded-lg",
          // Responsive width
          isMobile ? "w-[calc(100vw-2rem)] max-w-[500px] min-w-[300px]" : "w-full max-w-lg",
          // Positioning (from getPositioning)
          positioning.className,
          className
        )}
        style={{
          ...positioning.style,
          overscrollBehavior: isMobile ? 'contain' : undefined,
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
          // Enhanced mobile touch target without background box
          isMobile ? "w-11 h-11 flex items-center justify-center" : ""
        )}>
          <X className={cn(
            "h-4 w-4", 
            isMobile ? "h-5 w-5 flex-shrink-0" : ""
          )} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

MobileDialogContent.displayName = "MobileDialogContent";

export { MobileDialogContent };
