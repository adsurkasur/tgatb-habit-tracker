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
  const getPositioning = () => {
    if (!isMobile) {
      // Desktop: use default centering
      return {
        className: "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
        style: {}
      };
    }

    // Mobile positioning
    const baseStyle = {
      position: 'fixed' as const,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100vw - 2rem)', // Less margin, wider modal
      maxWidth: '500px', // Slightly larger max width
      minWidth: '300px', // Minimum width to prevent too narrow
    };

    if (isKeyboardOpen) {
      // Center vertically in available viewport space when keyboard is open
      const availableHeight = viewportHeight;
      const modalHeight = Math.min(400, availableHeight * 0.8); // Use 80% of available space or 400px max
      const topPosition = (availableHeight - modalHeight) / 2; // Center in available space
      
      return {
        className: "fixed",
        style: {
          ...baseStyle,
          top: `${Math.max(20, topPosition)}px`, // Ensure minimum 20px from top
          transform: 'translateX(-50%)', // Only center horizontally, not vertically (since we calculated top)
          height: 'fit-content',
          maxHeight: `${modalHeight}px`,
        }
      };
    }

    // Center vertically when keyboard is closed - more even spacing
    return {
      className: "fixed",
      style: {
        ...baseStyle,
        top: '50%',
        transform: 'translateX(-50%) translateY(-50%)', // Perfect center
        maxHeight: '75vh', // Slightly more height allowance
      }
    };
  };

  const positioning = getPositioning();

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay 
        className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        style={{
          // Make overlay responsive to virtual keyboard
          ...(isMobile && isKeyboardOpen && {
            height: `${viewportHeight}px`,
            bottom: 'auto'
          }),
          // Completely prevent scrolling on the overlay
          touchAction: 'none',
          overscrollBehavior: 'none',
          overflow: 'hidden'
        }}
        onTouchMove={(e) => {
          // Only prevent scroll-related touch moves, not taps/clicks
          e.preventDefault();
          e.stopPropagation();
        }}
        onWheel={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onScroll={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "z-50 grid gap-4 border bg-background p-6 shadow-lg duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "overflow-y-auto rounded-lg",
          // Apply responsive width - more proportionate sizing
          isMobile ? "w-auto" : "w-full max-w-lg",
          positioning.className,
          className
        )}
        style={{
          ...positioning.style,
          // Prevent overscroll behavior
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
