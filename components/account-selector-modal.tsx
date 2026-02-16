"use client";

import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { type KnownAccount, getKnownAccounts } from "@/lib/account-registry";
import { User, LogIn } from "lucide-react";

interface AccountSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAccount: (accountId: string) => void;
  onNewLogin: () => void;
}

export function AccountSelectorModal({
  open,
  onOpenChange,
  onSelectAccount,
  onNewLogin,
}: AccountSelectorModalProps) {
  const accounts = getKnownAccounts();

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent dialogClassName="w-full max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Choose Account</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>
          <div className="space-y-2">
            {/* Anonymous account - always available */}
            <button
              onClick={() => {
                onSelectAccount("anonymous");
                onOpenChange(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">Anonymous</p>
                <p className="text-xs text-muted-foreground">Local data only</p>
              </div>
            </button>

            {/* Known accounts */}
            {accounts.map((account) => (
              <button
                key={account.accountId}
                onClick={() => {
                  onSelectAccount(account.accountId);
                  onOpenChange(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {account.avatarUrl ? (
                    <img
                      src={account.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{account.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{account.accountId.slice(0, 12)}...</p>
                </div>
              </button>
            ))}
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => {
                onOpenChange(false);
                onNewLogin();
              }}
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with Google
            </Button>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
