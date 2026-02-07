"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
 * Usage:
 *   <ResponsiveDialog open={open} onOpenChange={setOpen}>
 *     <ResponsiveDialogHeader>
 *       <ResponsiveDialogTitle>Title</ResponsiveDialogTitle>
 *       <ResponsiveDialogDescription>Description</ResponsiveDialogDescription>
 *     </ResponsiveDialogHeader>
 *     <ResponsiveDialogBody>...content...</ResponsiveDialogBody>
 *     <ResponsiveDialogFooter>...buttons...</ResponsiveDialogFooter>
 *   </ResponsiveDialog>
 */

// ─── Context ─────────────────────────────────────────────
interface ResponsiveDialogContextValue {
  isMobile: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResponsiveDialogContext = React.createContext<ResponsiveDialogContextValue>({
  isMobile: false,
  onOpenChange: () => {},
});

function useResponsiveDialog() {
  return React.useContext(ResponsiveDialogContext);
}

// ─── Root ────────────────────────────────────────────────
interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function ResponsiveDialog({ open, onOpenChange, children }: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  return (
    <ResponsiveDialogContext.Provider value={{ isMobile, onOpenChange }}>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
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
  const { isMobile } = useResponsiveDialog();

  if (isMobile) {
    return (
      <DrawerContent
        className={cn(
          "max-h-[90vh]",
          className,
          drawerClassName,
        )}
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
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)} {...props}>
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
