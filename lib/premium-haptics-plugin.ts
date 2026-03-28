import { registerPlugin } from "@capacitor/core";
import type { HapticEvent, HapticProfile } from "@/lib/haptics";

export interface PremiumHapticsPlugin {
  isSupported(): Promise<{ supported: boolean }>;
  setProfile(options: { profile: HapticProfile }): Promise<void>;
  warmup(): Promise<void>;
  play(options: { event: HapticEvent; profile?: HapticProfile }): Promise<void>;
}

export const PremiumHaptics = registerPlugin<PremiumHapticsPlugin>("PremiumHaptics");
