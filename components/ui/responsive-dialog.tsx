"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  onOpenChange: (open: boolean) => void;
  drawerSize: "standard" | "compact";
  activeSnapPoint: number | string | null;
}

const ResponsiveDialogContext = React.createContext<ResponsiveDialogContextValue>({
  isMobile: false,
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

  return (
    <ResponsiveDialogContext.Provider value={{ isMobile, onOpenChange, drawerSize, activeSnapPoint: isStandard ? activeSnap : null }}>
      {isMobile ? (
        isStandard ? (
          <Drawer
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[0.45, 0.85, 1]}
            activeSnapPoint={activeSnap}
            setActiveSnapPoint={setActiveSnap}
            fadeFromIndex={1}
            snapToSequentialPoint
          >
            {children}
          </Drawer>
        ) : (
          <Drawer open={open} onOpenChange={onOpenChange}>
            {children}
          </Drawer>
        )
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
  const { isMobile, drawerSize, activeSnapPoint } = useResponsiveDialog();

  if (isMobile) {
    // At the minimum snap point (0.45), prevent outside-click dismissal.
    // The overlay is invisible at this snap (fadeFromIndex=1), but Radix still
    // fires onPointerDownOutside. Preventing it avoids deceptive dismiss.
    const isAtMinSnap = drawerSize === "standard" && activeSnapPoint === 0.45;

    return (
      <DrawerContent
        className={cn(
          // Standard drawers: full viewport height so snap-point offsets map correctly.
          // Compact drawers: cap at 90vh for content-based sizing.
          drawerSize === "compact" ? "max-h-[90vh]" : "h-[100dvh] flex flex-col",
          className,
          drawerClassName,
        )}
        onPointerDownOutside={isAtMinSnap ? (e) => e.preventDefault() : undefined}
      >
        {children}
      </DrawerContent>
    );
  }

  return (
    <DialogContent
      className={cn(
        "material-radius-lg surface-elevation-3 [&>button]:hidden",
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
  const { isMobile, onOpenChange } = useResponsiveDialog();
  const Comp = isMobile ? DrawerHeader : DialogHeader;

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
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 mt-0.5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1 flex items-center justify-center cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
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
  const { isMobile } = useResponsiveDialog();
  const Comp = isMobile ? DrawerTitle : DialogTitle;

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
  const { isMobile } = useResponsiveDialog();
  const Comp = isMobile ? DrawerDescription : DialogDescription;

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
  const { isMobile, drawerSize, activeSnapPoint } = useResponsiveDialog();

  // On mobile standard drawers, constrain the scroll area to the visible snap height
  // minus overhead for pill handle + header (~5rem). This prevents content from
  // extending below the viewport at lower snap points.
  const adaptiveStyle = React.useMemo(() => {
    if (!isMobile || drawerSize !== "standard" || typeof activeSnapPoint !== "number") return undefined;
    return { maxHeight: `calc(${activeSnapPoint * 100}dvh - 5rem)` };
  }, [isMobile, drawerSize, activeSnapPoint]);

  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)} style={adaptiveStyle} {...props}>
      {children}
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────
function ResponsiveDialogFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile } = useResponsiveDialog();
  const Comp = isMobile ? DrawerFooter : DialogFooter;

  return (
    <Comp className={cn(isMobile ? "px-4 pb-6" : "", className)} {...props}>
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
  const { isMobile } = useResponsiveDialog();
  const Comp = isMobile ? DrawerClose : DialogClose;

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
