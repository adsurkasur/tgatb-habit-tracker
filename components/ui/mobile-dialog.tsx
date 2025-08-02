import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { isKeyboardOpen, viewportHeight } = useVirtualKeyboard();
  const isMobile = useIsMobile();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Scroll the focused input into view when keyboard opens
  React.useEffect(() => {
    if (isKeyboardOpen && isMobile && contentRef.current) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        // Small delay to ensure the keyboard animation is complete
        setTimeout(() => {
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 150);
      }
    }
  }, [isKeyboardOpen, isMobile]);

  // Calculate positioning based on keyboard state - only use CSS classes for desktop
  const getPositionClass = () => {
    if (isMobile === undefined || !isMobile) {
      // Desktop or hydration: use CSS classes only
      return "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]";
    }

    // Mobile: use minimal CSS, let inline styles do the work
    return "fixed";
  };

  // Calculate max height based on available space
  const getMaxHeight = () => {
    if (isMobile === undefined || !isMobile) {
      return undefined; // No restriction on desktop or during hydration
    }

    if (isKeyboardOpen) {
      // Reserve space for keyboard and some padding
      const availableHeight = viewportHeight * 0.8; // Use 80% of visible viewport
      return `${availableHeight}px`;
    }

    // Mobile without keyboard: use reasonable max height
    return "85vh";
  };

  // Calculate width classes based on device type
  const getWidthClasses = () => {
    return "w-full"; // Always safe default
  };

  // Get margin and max-width classes for mobile
  const getMobileSpacingClasses = () => {
    if (isMobile === undefined || !isMobile) {
      return "max-w-lg"; // Desktop default or hydration safe
    }
    
    // Mobile: no classes, let inline styles handle everything
    return "";
  };

  // Calculate inline styles for positioning
  const getPositioningStyles = () => {
    if (isMobile === undefined || !isMobile) {
      return {}; // Let CSS classes handle desktop positioning
    }

    // Mobile-specific positioning - completely override CSS
    const baseStyles = {
      width: 'calc(100vw - 3rem)',
      maxWidth: 'calc(100vw - 3rem)',
      left: '50%',
      marginLeft: '0',
      marginRight: '0',
      // Override any CSS positioning
      position: 'fixed' as const,
    };

    if (isKeyboardOpen) {
      // When keyboard is open, position from top using viewport units that are stable
      return {
        ...baseStyles,
        top: '10vh', // Use viewport units instead of percentage to avoid address bar issues
        transform: 'translateX(-50%)',
        // Remove translateY to avoid conflicts with dynamic viewport
      };
    }

    // When keyboard is closed, use a safe top position that accounts for address bar
    return {
      ...baseStyles,
      top: '20vh', // Start lower to avoid address bar, use viewport units
      transform: 'translateX(-50%)',
      // Don't use translateY(-50%) as it can cause issues with dynamic viewport
    };
  };

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={ref}
        data-keyboard-open={isMobile && isKeyboardOpen ? "true" : undefined}
        className={cn(
          "z-50 grid gap-4 border bg-background p-4 shadow-lg duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "sm:rounded-lg sm:p-6 overflow-y-auto",
          // Width classes based on device
          getWidthClasses(),
          // Mobile spacing and constraints
          getMobileSpacingClasses(),
          isMobile && isKeyboardOpen ? "rounded-t-lg" : "",
          isMobile ? "rounded-lg" : "",
          getPositionClass(),
          className
        )}
        style={{
          maxHeight: getMaxHeight(),
          transition: "all 0.3s ease-in-out",
          // Apply positioning styles - these override CSS classes when present
          ...getPositioningStyles(),
          // Ensure z-index is high enough
          zIndex: isMobile ? 9999 : undefined,
        }}
        {...props}
      >
        <div ref={contentRef} className="relative">
          {children}
        </div>
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

MobileDialogContent.displayName = "MobileDialogContent";

export { MobileDialogContent };
