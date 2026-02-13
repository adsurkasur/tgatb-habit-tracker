"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, FileText, Github, Heart, Shield, Zap } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
} from "@/components/ui/responsive-dialog";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const version = process.env.APP_VERSION || "1.0.0";
  
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent dialogClassName="w-full max-w-2xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            About TGATB Habit Tracker
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
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
                  onClick={() => Capacitor.isNativePlatform() ? (window.location.href = '/privacy-policy/') : window.open('/privacy-policy', '_blank')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start h-8"
                  onClick={() => Capacitor.isNativePlatform() ? (window.location.href = '/terms-of-service/') : window.open('/terms-of-service', '_blank')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Terms of Service
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
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
