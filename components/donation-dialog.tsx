import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Heart, DollarSign, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        ₿
      </div>
    ),
    address: 'bc1q7d4t6ne3a44x2sujd5ektlngc9j0jfzhyn38z5',
    color: 'hover:text-orange-400',
  },
  {
    name: 'EVM',
    icon: (
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        Ξ
      </div>
    ),
    address: '0xc53F031fe8cE7970D6Ff00fE65ef80617a893B44',
    color: 'hover:text-blue-400',
  },
  {
    name: 'Solana',
    icon: (
      <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
        S
      </div>
    ),
    address: '3ymZGds5iphv4UNdSzv8DWaHeKGsCTe89sZwZMms2u9z',
    color: 'hover:text-purple-400',
  },
  {
    name: 'Sui',
    icon: (
      <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        SUI
      </div>
    ),
    address: '0x232363195ab483e8721f995cc9dbfbf7573ac471a86e51c9a71538f82c86f5f6',
    color: 'hover:text-cyan-400',
  },
];

export function DonationDialog({ open, onOpenChange }: DonationDialogProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
        duration: 2000,
      });

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopiedAddress(null);
      }, 3000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the address manually",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <Heart className="w-6 h-6 text-red-500" />
            Support Me
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            If you enjoy this app, consider supporting its development. Every contribution helps keep it free and improving!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Payment Platforms */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Payment Platforms
            </h3>
            
            {supportContacts.map((contact) => (
              <Card
                key={contact.name}
                className="p-4 hover:bg-accent/50 transition-all duration-200 cursor-pointer group"
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
                      <p className="text-sm text-muted-foreground">{contact.label}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </Card>
            ))}
          </div>

          {/* Cryptocurrency */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Cryptocurrency
            </h3>
            
            {cryptoList.map((crypto) => (
              <Card
                key={crypto.name}
                className="p-4 hover:bg-accent/50 transition-all duration-200 cursor-pointer group"
                onClick={() => handleCopy(crypto.address)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`group-hover:scale-110 transition-transform ${crypto.color}`}>
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
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {crypto.address}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {copiedAddress === crypto.address ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Copied!
                      </Badge>
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Thank You Message */}
          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Thank you for considering supporting this project! 🙏
              <br />
              Your support helps keep this app free and continuously improving.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
