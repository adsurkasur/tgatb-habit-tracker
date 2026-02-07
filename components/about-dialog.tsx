"use client";

import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileDialogContent } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Github, Heart, Shield, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const version = process.env.APP_VERSION || "1.0.0";
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <MobileDialogContent className={`w-full max-w-2xl material-radius-lg surface-elevation-3 [&>button]:hidden ${isMobile ? "p-0 flex flex-col gap-0 h-auto" : ""}`}> 
        <DialogHeader className={`px-6 ${isMobile ? 'py-2' : 'pb-4'} border-b bg-background z-10 shrink-0 space-y-0 flex-row! text-left! relative`}>
          <div className="flex items-center w-full justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              About TGATB Habit Tracker
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>
        
        <div className={`${isMobile ? "overflow-y-auto px-6 pt-4 pb-4" : ""}`}>
          <div className="space-y-4">
          {/* Project Info */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">The Good and The Bad</h3>
            <p className="text-sm text-muted-foreground">
              A minimalist Progressive Web App for tracking your daily habits
            </p>
            <Badge variant="secondary" className="text-xs">
              Version {version}
            </Badge>
          </div>
          
          <Separator />
          
          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Track good and bad habits</li>
              <li>• Offline support with PWA technology</li>
              <li>• Streak tracking and visual progress</li>
              <li>• Minimalist, distraction-free design</li>
              <li>• Cross-platform compatibility</li>
            </ul>
          </div>
          
          <Separator />
          
          {/* Tech Stack */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Built with</h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">Next.js 16</Badge>
              <Badge variant="outline" className="text-xs">React 19</Badge>
              <Badge variant="outline" className="text-xs">TypeScript</Badge>
              <Badge variant="outline" className="text-xs">Tailwind CSS v4</Badge>
              <Badge variant="outline" className="text-xs">PWA</Badge>
              <Badge variant="outline" className="text-xs">Capacitor</Badge>
            </div>
          </div>
          
          <Separator />
          
          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Links</h4>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start h-8"
                onClick={() => window.open('https://github.com/adsurkasur/tgatb-habit-tracker', '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="justify-start h-8"
                onClick={() => window.open('https://vercel.com/ades-projects-2025/tgatb-habit-tracker', '_blank')}
              >
                <Heart className="w-4 h-4 mr-2" />
                Powered by Vercel
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="justify-start h-8"
                onClick={() => window.open('/privacy-policy', '_blank')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Made with ❤️ for better habits</p>
            <p className="mt-1">&copy; 2025-2026 TGATB Habit Tracker</p>
          </div>
        </div>
        </div>
      </MobileDialogContent>
    </Dialog>
  );
}
