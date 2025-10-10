import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MobileDialogContent } from '@/components/ui/mobile-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Heart, DollarSign, Coffee, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMobileBackNavigation } from '@/hooks/use-mobile-back-navigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SupportContactItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  label: string;
  color: string;
}

interface CryptoItem {
  name: string;
  icon: React.ReactNode;
  address: string;
  color: string;
}

const supportContacts: SupportContactItem[] = [
  {
    name: 'Trakteer',
    icon: <DollarSign className="w-5 h-5" />,
    href: 'https://trakteer.id/adsurkasur',
    label: 'trakteer.id/adsurkasur',
    color: 'hover:text-green-400'
  },
  {
    name: 'Ko-fi',
    icon: <Coffee className="w-5 h-5" />,
    href: 'https://ko-fi.com/adsurkasur',
    label: 'ko-fi.com/adsurkasur',
    color: 'hover:text-yellow-400'
  }
];

const cryptoList: CryptoItem[] = [
  {
    name: 'Bitcoin',
    icon: (
      <span className="w-6 h-6 block" aria-label="Bitcoin Logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4091.27 4091.73" width="24" height="24">
          <g>
            <path fill="#F7931A" d="M4030.06 2540.77c-273.24,1096.01 -1383.32,1763.02 -2479.46,1489.71 -1095.68,-273.24 -1762.69,-1383.39 -1489.33,-2479.31 273.12,-1096.13 1383.2,-1763.19 2479,-1489.95 1096.06,273.24 1763.03,1383.51 1489.76,2479.57l0.02 -0.02z"/>
            <path fill="white" d="M2947.77 1754.38c40.72,-272.26 -166.56,-418.61 -450,-516.24l91.95 -368.8 -224.5 -55.94 -89.51 359.09c-59.02,-14.72 -119.63,-28.59 -179.87,-42.34l90.16 -361.46 -224.36 -55.94 -92 368.68c-48.84,-11.12 -96.81,-22.11 -143.35,-33.69l0.26 -1.16 -309.59 -77.31 -59.72 239.78c0,0 166.56,38.18 163.05,40.53 90.91,22.69 107.35,82.87 104.62,130.57l-104.74 420.15c6.26,1.59 14.38,3.89 23.34,7.49 -7.49,-1.86 -15.46,-3.89 -23.73,-5.87l-146.81 588.57c-11.11,27.62 -39.31,69.07 -102.87,53.33 2.25,3.26 -163.17,-40.72 -163.17,-40.72l-111.46 256.98 292.15 72.83c54.35,13.63 107.61,27.89 160.06,41.3l-92.9 373.03 224.24 55.94 92 -369.07c61.26,16.63 120.71,31.97 178.91,46.43l-91.69 367.33 224.51 55.94 92.89 -372.33c382.82,72.45 670.67,43.24 791.83,-303.02 97.63,-278.78 -4.86,-439.58 -206.26,-544.44 146.69,-33.83 257.18,-130.31 286.64,-329.61l-0.07 -0.05zm-512.93 719.26c-69.38,278.78 -538.76,128.08 -690.94,90.29l123.28 -494.2c152.17,37.99 640.17,113.17 567.67,403.91zm69.43 -723.3c-63.29,253.58 -453.96,124.75 -580.69,93.16l111.77 -448.21c126.73,31.59 534.85,90.55 468.94,355.05l-0.02 0z"/>
          </g>
        </svg>
      </span>
    ),
    address: 'bc1q7d4t6ne3a44x2sujd5ektlngc9j0jfzhyn38z5',
    color: 'hover:text-orange-400',
  },
  {
    name: 'EVM',
    icon: (
      <span className="w-6 h-6 block" aria-label="Ethereum Logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 784.37 1277.39" width="24" height="24">
          <g>
            <polygon fill="#343434" points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54"/>
            <polygon fill="#8C8C8C" points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33"/>
            <polygon fill="#3C3C3B" points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89"/>
            <polygon fill="#8C8C8C" points="392.07,1277.38 392.07,956.52 -0,724.89"/>
            <polygon fill="#141414" points="392.07,882.29 784.13,650.54 392.07,472.33"/>
            <polygon fill="#393939" points="0,650.54 392.07,882.29 392.07,472.33"/>
          </g>
        </svg>
      </span>
    ),
    address: '0xc53F031fe8cE7970D6Ff00fE65ef80617a893B44',
    color: 'hover:text-blue-400',
  },
  {
    name: 'Solana',
    icon: (
      <span className="w-6 h-6 block" aria-label="Solana Logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 397.7 311.7" width="24" height="24">
          <defs>
            <linearGradient id="solana1" gradientUnits="userSpaceOnUse" x1="360.8791" y1="351.4553" x2="141.213" y2="-69.2936" gradientTransform="matrix(1 0 0 -1 0 314)">
              <stop offset="0" stopColor="#00FFA3"/>
              <stop offset="1" stopColor="#DC1FFF"/>
            </linearGradient>
            <linearGradient id="solana2" gradientUnits="userSpaceOnUse" x1="264.8291" y1="401.6014" x2="45.163" y2="-19.1475" gradientTransform="matrix(1 0 0 -1 0 314)">
              <stop offset="0" stopColor="#00FFA3"/>
              <stop offset="1" stopColor="#DC1FFF"/>
            </linearGradient>
            <linearGradient id="solana3" gradientUnits="userSpaceOnUse" x1="312.5484" y1="376.688" x2="92.8822" y2="-44.061" gradientTransform="matrix(1 0 0 -1 0 314)">
              <stop offset="0" stopColor="#00FFA3"/>
              <stop offset="1" stopColor="#DC1FFF"/>
            </linearGradient>
          </defs>
          <path fill="url(#solana1)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
          <path fill="url(#solana2)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
          <path fill="url(#solana3)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
        </svg>
      </span>
    ),
    address: '3ymZGds5iphv4UNdSzv8DWaHeKGsCTe89sZwZMms2u9z',
    color: 'hover:text-purple-400',
  },
  {
    name: 'Sui',
    icon: (
      <span className="w-6 h-6 block" aria-label="Sui Logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 383.5" width="24" height="24">
          <path fill="#4DA2FF" fillRule="evenodd" clipRule="evenodd" d="M240.1,159.9c15.6,19.6,25,44.5,25,71.5s-9.6,52.6-25.7,72.4l-1.4,1.7l-0.4-2.2c-0.3-1.8-0.7-3.7-1.1-5.6c-8-35.3-34.2-65.6-77.4-90.2c-29.1-16.5-45.8-36.4-50.2-59c-2.8-14.6-0.7-29.3,3.3-41.9c4.1-12.6,10.1-23.1,15.2-29.4l16.8-20.5c2.9-3.6,8.5-3.6,11.4,0L240.1,159.9L240.1,159.9z M266.6,139.4L154.2,2c-2.1-2.6-6.2-2.6-8.3,0L33.4,139.4l-0.4,0.5C12.4,165.6,0,198.2,0,233.7c0,82.7,67.2,149.8,150,149.8c82.8,0,150-67.1,150-149.8c0-35.5-12.4-68.1-33.1-93.8L266.6,139.4L266.6,139.4z M60.3,159.5l10-12.3l0.3,2.3c0.2,1.8,0.5,3.6,0.9,5.4c6.5,34.1,29.8,62.6,68.6,84.6c33.8,19.2,53.4,41.3,59.1,65.6c2.4,10.1,2.8,20.1,1.8,28.8l-0.1,0.5l-0.5,0.2c-15.2,7.4-32.4,11.6-50.5,11.6c-63.5,0-115-51.4-115-114.8C34.9,204.2,44.4,179.1,60.3,159.5L60.3,159.5z"/>
        </svg>
      </span>
    ),
    address: '0x232363195ab483e8721f995cc9dbfbf7573ac471a86e51c9a71538f82c86f5f6',
    color: 'hover:text-cyan-400',
  },
];

export function DonationDialog({ open, onOpenChange }: DonationDialogProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showQrisModal, setShowQrisModal] = useState(false);

  // Handle mobile back navigation
  useMobileBackNavigation({
    onBackPressed: () => {
      if (showQrisModal) {
        setShowQrisModal(false);
        return;
      }
      onOpenChange(false);
    },
    isActive: open || showQrisModal
  });

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
        duration: 3000,
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopiedAddress(null);
      }, 3000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the address manually",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Choose the appropriate dialog content component - using MobileDialogContent for consistency

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <MobileDialogContent className={`material-radius-lg surface-elevation-3 [&>button]:hidden ${isMobile ? "w-full max-w-full p-0 flex flex-col h-[90vh] max-h-[90vh] gap-0" : "w-[500px] h-[90vh] max-h-[90vh] flex flex-col items-stretch justify-start"}`}>
        <DialogHeader className={`px-6 ${isMobile ? 'py-2' : 'pb-4'} border-b bg-background z-10 flex-shrink-0 space-y-0 !flex-row !text-left relative`}>
          <div className="flex items-center w-full justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Support Me
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>

  <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6" style={{ minHeight: 0 }}>
          <DialogDescription className="text-center mb-6">
            If you enjoy this app, consider supporting its development. Every contribution helps keep it free and improving!
          </DialogDescription>
          <div className="space-y-6">
          {/* Payment Platforms */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Payment Platforms
            </h3>
            {/* Render Trakteer and Ko-fi cards */}
            {supportContacts.map((contact) => (
              <Card
                key={contact.name}
                className="p-4 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] transition-all duration-200 cursor-pointer group state-layer-hover"
              >
                <a
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors ${contact.color}`}>
                      {contact.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{contact.name}</h4>
                      <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/70 transition-colors">{contact.label}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                </a>
              </Card>
            ))}
            {/* QRIS Card */}
            <Card
              className="p-4 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] transition-all duration-200 cursor-pointer group state-layer-hover"
              onClick={() => setShowQrisModal(true)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {/* QR code icon (Lucide) - theme adaptive */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h4v4H3V3zm0 8h4v4H3v-4zm8-8h4v4h-4V3zm0 8h4v4h-4v-4zm5 5h3v3h-3v-3z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-medium">QRIS</h4>
                    <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/70 transition-colors">Support me with QRIS!</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
              </div>
            </Card>
            {/* QRIS Modal */}
            {showQrisModal && (
              <Dialog open={showQrisModal} onOpenChange={setShowQrisModal}>
                <MobileDialogContent className={`w-full max-w-md material-radius-lg surface-elevation-3 [&>button]:hidden p-0 flex flex-col gap-0`}>
                  <DialogHeader className={`px-6 py-2 border-b bg-background z-10 flex-shrink-0 space-y-0 !flex-row !text-left relative`}>
                    <div className="flex items-center w-full justify-between">
                      <DialogTitle className="flex items-center gap-2">
                        {/* QR code icon - theme adaptive */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h4v4H3V3zm0 8h4v4H3v-4zm8-8h4v4h-4V3zm0 8h4v4h-4v-4zm5 5h3v3h-3v-3z" /></svg>
                        QRIS
                      </DialogTitle>
                      <button
                        type="button"
                        onClick={() => setShowQrisModal(false)}
                        className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        <span className="sr-only">Close</span>
                      </button>
                    </div>
                  </DialogHeader>
                  <div className="overflow-y-auto px-6 pt-4 pb-4 flex flex-col items-center">
                    <Image src="/payment/qris-ade.jpg" alt="QRIS Donation Method" width={320} height={320} className="rounded-lg shadow-lg w-full max-w-xs" />
                    <button
                      type="button"
                      className="mt-6 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/80 transition-colors"
                      onClick={async () => {
                        const isNative = typeof window !== 'undefined' && (await import('@/lib/capacitor')).isNativePlatform();
                        const filename = 'qris-ade.jpg';
                        const imageUrl = '/payment/qris-ade.jpg';
                        if (isNative) {
                          try {
                            // Fetch image as blob
                            const res = await fetch(imageUrl);
                            const blob = await res.blob();
                            // Convert to base64
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64 = reader.result?.toString().split(',')[1];
                              if (!base64) throw new Error('Failed to convert image');
                              try {
                                const { SaveAs } = await import('capacitor-save-as');
                                await SaveAs.showSaveAsPicker({
                                  filename,
                                  mimeType: 'image/jpeg',
                                  data: base64,
                                });
                                toast({ title: 'Saved!', description: 'QRIS image saved to device.', duration: 3000 });
                              } catch (error) {
                                    console.error(error);
                                    toast({ title: 'Save failed', description: 'Could not save image.', variant: 'destructive', duration: 3000 });
                                  }
                            };
                            reader.readAsDataURL(blob);
                          } catch (error) {
                            console.error(error);
                            toast({ title: 'Download failed', description: 'Could not fetch image.', variant: 'destructive', duration: 3000 });
                          }
                        } else {
                          // Web: anchor download
                          const link = document.createElement('a');
                          link.href = imageUrl;
                          link.download = filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {/* Download icon (Lucide) */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
                        Download QRIS
                      </span>
                    </button>
                  </div>
                </MobileDialogContent>
              </Dialog>
            )}
          </div>

          {/* Cryptocurrency */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M13.425 6.432c1.983.19 3.538.778 3.71 2.528.117 1.276-.438 2.035-1.355 2.463 1.481.359 2.382 1.202 2.196 3.072-.227 2.343-2.035 2.952-4.62 3.08l.004 2.42-1.522.002-.004-2.42c-.166-.002-.34 0-.519.003-.238.003-.484.006-.731-.001l.004 2.42-1.52.001-.004-2.42-3.044-.058.256-1.768s1.15.024 1.129.012c.423-.002.549-.293.58-.485l-.008-3.878.012-2.76c-.046-.288-.248-.634-.87-.644.033-.03-1.115.001-1.115.001L6 6.38l3.12-.005-.004-2.37 1.571-.002.004 2.37c.304-.008.603-.005.906-.003l.3.002-.005-2.37L13.422 4l.003 2.432zm-2.92 4.46l.076.002c.926.04 3.67.155 3.673-1.457-.004-1.532-2.339-1.482-3.423-1.46-.129.003-.24.006-.327.005v2.91zm.129 4.75l-.134-.005v-2.91c.097.002.218 0 .359-.002 1.282-.015 4.145-.05 4.132 1.494.014 1.597-3.218 1.468-4.357 1.423z" clipRule="evenodd" />
              </svg>
              Cryptocurrency
            </h3>
            
            {cryptoList.map((crypto) => (
              <Card
                key={crypto.name}
                className="p-4 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] transition-all duration-200 cursor-pointer group state-layer-hover"
                onClick={() => handleCopy(crypto.address)}
              >
                <div className="flex items-center space-x-3">
                  <div className={crypto.color}>
                    {crypto.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{crypto.name}</h4>
                      {copiedAddress === crypto.address && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Copied!
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono break-all group-hover:text-accent-foreground/70 transition-colors">
                      {crypto.address}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="relative w-4 h-4">
                      {copiedAddress === crypto.address ? (
                        <Check className="w-4 h-4 text-green-600 animate-in fade-in-0 zoom-in-50 duration-300" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors animate-in fade-in-0 zoom-in-95 duration-200" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Thank you for considering supporting this project! 🙏
            </p>
          </div>
        </div>
        </div>
      </MobileDialogContent>
    </Dialog>
  );
}
