"use client";

import * as React from "react";
import { CloseButton } from "@/components/ui/close-button";
import { useIsMobile } from "@/hooks/use-mobile";
import { isNativePlatform } from "@/hooks/use-platform";
import { useMobileBackNavigation } from "@/hooks/use-mobile-back-navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

/**
 * ResponsiveDialog — renders a Dialog on desktop and a bottom-sheet Drawer on mobile.
 *
 * Features:
 * - Automatic back-navigation handling (global stack, one-at-a-time dismissal)
 * - Drawer snap points for standard modals (drag to resize / expand to fullscreen)
 * - Compact mode for small-content modals (content-based height)
 *
 * Usage:
 *   <ResponsiveDialog open={open} onOpenChange={setOpen}>
 *     <ResponsiveDialogContent>
 *       <ResponsiveDialogHeader>
 *         <ResponsiveDialogTitle>Title</ResponsiveDialogTitle>
 *       </ResponsiveDialogHeader>
 *       <ResponsiveDialogBody>...content...</ResponsiveDialogBody>
 *       <ResponsiveDialogFooter>...buttons...</ResponsiveDialogFooter>
 *     </ResponsiveDialogContent>
 *   </ResponsiveDialog>
 */

// ─── Context ─────────────────────────────────────────────
interface ResponsiveDialogContextValue {
  isMobile: boolean;
  isDrawer: boolean;
  onOpenChange: (open: boolean) => void;
  drawerSize: "standard" | "compact";
  activeSnapPoint: number | string | null;
}

const ResponsiveDialogContext = React.createContext<ResponsiveDialogContextValue>({
  isMobile: false,
  isDrawer: false,
  onOpenChange: () => {},
  drawerSize: "standard",
  activeSnapPoint: null,
});

function useResponsiveDialog() {
  return React.useContext(ResponsiveDialogContext);
}

// ─── Root ────────────────────────────────────────────────
interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /**
   * Controls the mobile drawer sizing behavior.
   * - "standard" (default): Opens at 85vh with snap points, expandable to fullscreen.
   *   Dragging below the initial snap dismisses the modal.
   * - "compact": Content-based auto height. For small-content modals
   *   (Add Entry, Add Habit, Edit Entry, etc.)
   */
  drawerSize?: "standard" | "compact";
}

function ResponsiveDialog({ open, onOpenChange, children, drawerSize = "standard" }: ResponsiveDialogProps) {
  const isMobile = useIsMobile();
  // Policy: native app uses OS-level keyboard handling, so Vaul input repositioning must be off.
  // Mobile web (Android/iOS browsers, PWA) keeps Vaul repositioning enabled.
  const isNativeApp = isNativePlatform();
  const shouldUseDrawer = isMobile && !isNativeApp;

  // ── Automatic back-navigation (global stack) ──
  // Each ResponsiveDialog registers itself; the topmost one closes first.
  useMobileBackNavigation({
    onBackPressed: () => onOpenChange(false),
    isActive: open,
  });

  // Standard drawers: 3-snap-point resizable bottom sheet.
  //   [0.45, 0.85, 1] → safe-minimum, initial, fullscreen
  //   fadeFromIndex=1 → overlay fades below the 0.85 snap point
  //   snapToSequentialPoint → prevents fast-swipe from skipping snap points (no accidental dismiss)
  //   activeSnapPoint controlled → opens at 0.85, not 0.45
  // Compact drawers: content-based height (no snap points).
  const isStandard = drawerSize === "standard";
  const [activeSnap, setActiveSnap] = React.useState<number | string | null>(0.85);

  // Reset to initial snap point (0.85) each time the drawer opens
  React.useEffect(() => {
    if (open && isStandard) {
      setActiveSnap(0.85);
    }
  }, [open, isStandard]);

  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onOpenChange(nextOpen);
  }, [onOpenChange]);

  return (
    <ResponsiveDialogContext.Provider value={{ isMobile, isDrawer: shouldUseDrawer, onOpenChange, drawerSize, activeSnapPoint: shouldUseDrawer && isStandard ? activeSnap : null }}>
      {shouldUseDrawer ? (
        isStandard ? (
          <Drawer
            open={open}
            onOpenChange={handleOpenChange}
            handleOnly
            snapPoints={[0.45, 0.85, 1]}
            activeSnapPoint={activeSnap}
            setActiveSnapPoint={setActiveSnap}
            fadeFromIndex={1}
            snapToSequentialPoint
            // Keep a single keyboard owner per platform.
            // On native WebView, Vaul's keyboard repositioning causes a transient
            // downward shift because it mutates style.bottom via visualViewport while
            // snap transforms are still anchored to window.innerHeight. Disabling
            // repositionInputs prevents Vaul from touching bottom/height on keyboard
            // events, letting native scroll/pan handle input visibility.
            repositionInputs={!isNativeApp}
          >
            {children}
          </Drawer>
        ) : (
          <Drawer
            open={open}
            onOpenChange={handleOpenChange}
            handleOnly
              // Compact drawers: disable repositionInputs entirely (both native + web) to prevent
              // keyboard push behavior. Compact modals are small and should let the system handle
              // keyboard visibility without drawer interference. This prevents the "object pushing
              // screen" visual bug where content shifts upward when keyboard appears.
              repositionInputs={false}
          >
            {children}
          </Drawer>
        )
      ) : (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          {children}
        </Dialog>
      )}
    </ResponsiveDialogContext.Provider>
  );
}

// ─── Content ─────────────────────────────────────────────
interface ResponsiveDialogContentProps {
  className?: string;
  children: React.ReactNode;
  /** Extra class applied only on desktop dialog */
  dialogClassName?: string;
  /** Extra class applied only on mobile drawer */
  drawerClassName?: string;
}

function ResponsiveDialogContent({
  className,
  children,
  dialogClassName,
  drawerClassName,
}: ResponsiveDialogContentProps) {
  const { isDrawer, onOpenChange, drawerSize, activeSnapPoint } = useResponsiveDialog();
  const isNativeApp = isNativePlatform();
  const useNativeMobileSheet = !isDrawer && isNativeApp;

  if (isDrawer) {
    const isAtMinSnap = drawerSize === "standard" && activeSnapPoint === 0.45;

    return (
      <DrawerContent
        className={cn(
          // Standard drawers: full viewport height so snap-point offsets map correctly.
          // Compact drawers: cap at 90vh for content-based sizing.
          drawerSize === "compact"
            ? "max-h-[90vh]"
            : isNativeApp
              ? "h-full flex flex-col"
              : "h-dvh flex flex-col",
          className,
          drawerClassName,
        )} 
      >
        {/* Tap-to-dismiss scrim — at the peeking snap the vaul overlay is faded out,
            so we render our own invisible touch target above the drawer to let users
            tap-outside-to-close. */}
        {isAtMinSnap && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
        )}
        {/* Peek indicator — shown only at the minimum snap point */}
        {isAtMinSnap && (
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 z-10 px-3 py-1 rounded-full bg-muted/80 backdrop-blur-sm text-muted-foreground text-xs animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
          >
            Peeking… 👀
          </div>
        )}
        {children}
      </DrawerContent>
    );
  }

  return (
    <DialogContent
      className={cn(
        "material-radius-lg surface-elevation-3 min-w-0 [&>button]:hidden [&_button]:max-w-full",
        useNativeMobileSheet &&
          "!left-0 !right-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 !w-screen !max-w-none !rounded-t-[10px] !rounded-b-none !p-0 !gap-0 !flex !flex-col !max-h-[90vh]",
        className,
        dialogClassName,
      )}
    >
      {children}
    </DialogContent>
  );
}

// ─── Header ──────────────────────────────────────────────
interface ResponsiveDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ResponsiveDialogHeader({ className, children, ...props }: ResponsiveDialogHeaderProps) {
  const { isMobile, isDrawer, onOpenChange } = useResponsiveDialog();
  const Comp = isDrawer ? DrawerHeader : DialogHeader;

  return (
    <Comp
      className={cn(
        "shrink-0 border-b border-border",
        isMobile ? "px-4 pb-3 pt-0 text-left" : "pb-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">{children}</div>
        {!isMobile && (
          <CloseButton
            className="shrink-0 mt-0.5"
            onClick={() => onOpenChange(false)}
          />
        )}
      </div>
    </Comp>
  );
}

// ─── Title ───────────────────────────────────────────────
function ResponsiveDialogTitle({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogTitle>) {
  const { isDrawer } = useResponsiveDialog();
  const Comp = isDrawer ? DrawerTitle : DialogTitle;

  return (
    <Comp className={cn("text-xl font-semibold", className)} {...props}>
      {children}
    </Comp>
  );
}

// ─── Description ─────────────────────────────────────────
function ResponsiveDialogDescription({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogDescription>) {
  const { isDrawer } = useResponsiveDialog();
  const Comp = isDrawer ? DrawerDescription : DialogDescription;

  return (
    <Comp className={className} {...props}>
      {children}
    </Comp>
  );
}

// ─── Body — scrollable content area ──────────────────────
interface ResponsiveDialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function ResponsiveDialogBody({ className, children, ...props }: ResponsiveDialogBodyProps) {
  const { isMobile, isDrawer, drawerSize, activeSnapPoint } = useResponsiveDialog();

  // On mobile standard drawers, constrain the scroll area to the visible snap height
  // minus overhead for pill handle + header (~5rem). This prevents content from
  // extending below the viewport at lower snap points.
  const adaptiveStyle = React.useMemo(() => {
    if (!isMobile || !isDrawer || drawerSize !== "standard" || typeof activeSnapPoint !== "number") return undefined;
    return { maxHeight: `calc(${activeSnapPoint * 100}dvh - 5rem)` };
  }, [isMobile, isDrawer, drawerSize, activeSnapPoint]);

  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)} style={adaptiveStyle} {...props}>
      {children}
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────
function ResponsiveDialogFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile, isDrawer } = useResponsiveDialog();
  const Comp = isDrawer ? DrawerFooter : DialogFooter;

  return (
    <Comp
      className={cn(
        isMobile ? "px-4 pb-6" : "",
        "*:min-w-0 [&>div]:w-full [&>div]:flex-wrap [&>div]:gap-2 [&>div]:*:min-w-0",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// ─── Close ───────────────────────────────────────────────
function ResponsiveDialogClose({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogClose>) {
  const { isDrawer } = useResponsiveDialog();
  const Comp = isDrawer ? DrawerClose : DialogClose;

  return (
    <Comp className={className} {...props}>
      {children}
    </Comp>
  );
}

export {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogClose,
  useResponsiveDialog,
};
