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
      // Position higher when keyboard is open - better sizing for keyboard state
      return {
        className: "fixed",
        style: {
          ...baseStyle,
          top: '2vh', // Start closer to top to maximize space
          bottom: '2vh', // Also set bottom constraint
          height: 'auto', // Let content determine height
          maxHeight: `${viewportHeight - 40}px`, // Use almost all available viewport height
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
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
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
