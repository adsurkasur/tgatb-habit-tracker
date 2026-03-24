"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, FileText, Github, Heart, Shield, Zap } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { withLocalePath, normalizeLocale, extractLocaleFromPathname } from "@/i18n/pathname";
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
  const t = useTranslations("AboutDialog");
  const version = process.env.APP_VERSION || "1.0.0";
  const router = useRouter();
  const pathname = usePathname();

  const navigateToPage = (path: string) => {
    const activeLocale = normalizeLocale(extractLocaleFromPathname(pathname || "/"));
    const localizedPath = withLocalePath(path, activeLocale);

    if (Capacitor.isNativePlatform()) {
      onOpenChange(false);
      router.push(localizedPath);
    } else {
      window.open(localizedPath, '_blank');
    }
  };
  
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent dialogClassName="w-full max-w-2xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {t("title")}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="space-y-4">
            {/* Project Info */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{t("projectName")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("projectDescription")}
              </p>
              <Badge variant="secondary" className="text-xs">
                {t("version", { version })}
              </Badge>
            </div>
            
            <Separator />
            
            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">{t("features.title")}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{t("features.item1")}</li>
                <li>{t("features.item2")}</li>
                <li>{t("features.item3")}</li>
                <li>{t("features.item4")}</li>
                <li>{t("features.item5")}</li>
              </ul>
            </div>
            
            <Separator />
            
            {/* Tech Stack */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">{t("builtWith")}</h4>
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
              <h4 className="font-medium text-sm">{t("links.title")}</h4>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start h-8"
                  onClick={() => window.open('https://github.com/adsurkasur/tgatb-habit-tracker', '_blank')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  {t("links.github")}
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start h-8"
                  onClick={() => window.open('https://vercel.com/ades-projects-2025/tgatb-habit-tracker', '_blank')}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {t("links.vercel")}
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start h-8"
                  onClick={() => navigateToPage('/privacy-policy')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t("links.privacyPolicy")}
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start h-8"
                  onClick={() => navigateToPage('/terms-of-service')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t("links.termsOfService")}
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground">
              <p>{t("footer.madeWithLove")}</p>
              <p className="mt-1">{t("footer.copyright")}</p>
            </div>
          </div>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
