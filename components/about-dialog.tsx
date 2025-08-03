"use client";

import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileDialogContent } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Github, Heart, Zap, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const version = "1.0.0"; // This would ideally come from package.json at build time
  const isMobile = useIsMobile();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MobileDialogContent className={`w-full max-w-md material-radius-lg surface-elevation-3 ${isMobile ? "p-0 flex flex-col gap-0 h-auto" : ""}`}>
        <DialogHeader className={`${isMobile ? "px-6 pt-2 pb-1 border-b bg-background z-10 flex-shrink-0 space-y-0 !flex-row !text-left" : ""}`}>
          <div className={`flex items-center w-full ${isMobile ? "justify-between" : ""}`}>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              About TGATB Habit Tracker
            </DialogTitle>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
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
              <Badge variant="outline" className="text-xs">Next.js 15</Badge>
              <Badge variant="outline" className="text-xs">React 18</Badge>
              <Badge variant="outline" className="text-xs">TypeScript</Badge>
              <Badge variant="outline" className="text-xs">Tailwind CSS</Badge>
              <Badge variant="outline" className="text-xs">PWA</Badge>
              <Badge variant="outline" className="text-xs">Workbox</Badge>
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
            </div>
          </div>
          
          <Separator />
          
          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Made with ❤️ for better habits</p>
            <p className="mt-1">© 2025 TGATB Habit Tracker</p>
          </div>
        </div>
        </div>
      </MobileDialogContent>
    </Dialog>
  );
}
