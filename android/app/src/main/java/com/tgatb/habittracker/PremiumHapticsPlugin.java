package com.tgatb.habittracker;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PremiumHaptics")
public class PremiumHapticsPlugin extends Plugin {
    private static final String PROFILE_SUBTLE = "subtle";
    private static final String PROFILE_PUNCHY = "punchy";
    private static final String PROFILE_BALANCED = "balanced";
    private static final long EVENT_MIN_GAP_MS = 28L;

    private String currentProfile = PROFILE_BALANCED;
    private long lastEventAt = 0L;

    @PluginMethod
    public void isSupported(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("supported", hasVibrator());
        call.resolve(ret);
    }

    @PluginMethod
    public void setProfile(PluginCall call) {
        String profile = normalizeProfile(call.getString("profile", PROFILE_BALANCED));
        currentProfile = profile;
        call.resolve();
    }

    @PluginMethod
    public void warmup(PluginCall call) {
        if (hasVibrator()) {
            vibrateOneShot(6, 30);
        }
        call.resolve();
    }

    @PluginMethod
    public void play(PluginCall call) {
        if (!hasVibrator()) {
            call.resolve();
            return;
        }

        long now = System.currentTimeMillis();
        if (now - lastEventAt < EVENT_MIN_GAP_MS) {
            call.resolve();
            return;
        }
        lastEventAt = now;

        String event = call.getString("event", "button");
        String profile = normalizeProfile(call.getString("profile", currentProfile));

        runPattern(event, profile);
        call.resolve();
    }

    private String normalizeProfile(String profile) {
        if (PROFILE_SUBTLE.equals(profile) || PROFILE_PUNCHY.equals(profile) || PROFILE_BALANCED.equals(profile)) {
            return profile;
        }
        return PROFILE_BALANCED;
    }

    private boolean hasVibrator() {
        Vibrator vibrator = getVibrator();
        return vibrator != null && vibrator.hasVibrator();
    }

    private Vibrator getVibrator() {
        Context context = getContext();
        if (context == null) return null;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vm = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return vm != null ? vm.getDefaultVibrator() : null;
        }

        return (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
    }

    private void runPattern(String event, String profile) {
        switch (event) {
            case "selection":
                playSelection(profile);
                return;
            case "navigation":
                playNavigation(profile);
                return;
            case "goodDone":
                playGoodDone(profile);
                return;
            case "goodNotDone":
                playGoodNotDone(profile);
                return;
            case "badAvoided":
                playBadAvoided(profile);
                return;
            case "badDone":
                playBadDone(profile);
                return;
            case "success":
                playSuccess(profile);
                return;
            case "streak":
                playStreak(profile);
                return;
            case "undo":
                playUndo(profile);
                return;
            case "failure":
                playFailure(profile);
                return;
            case "warning":
                playWarning(profile);
                return;
            case "error":
                playError(profile);
                return;
            case "button":
            default:
                playButton(profile);
        }
    }

    private void playButton(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateOneShot(12, 180);
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateOneShot(8, 90);
        } else {
            vibrateOneShot(10, 130);
        }
    }

    private void playSelection(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 8, 10, 10}, new int[] {0, 160, 0, 120});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateOneShot(7, 80);
        } else {
            vibrateOneShot(8, 110);
        }
    }

    private void playNavigation(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 8, 8, 12}, new int[] {0, 160, 0, 180});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateWaveform(new long[] {0, 7, 10, 9}, new int[] {0, 90, 0, 100});
        } else {
            vibrateWaveform(new long[] {0, 8, 10, 11}, new int[] {0, 120, 0, 140});
        }
    }

    private void playSuccess(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 10, 14, 14}, new int[] {0, 170, 0, 200});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateWaveform(new long[] {0, 8, 12, 10}, new int[] {0, 100, 0, 120});
        } else {
            vibrateWaveform(new long[] {0, 9, 14, 12}, new int[] {0, 140, 0, 165});
        }
    }

    private void playGoodDone(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 10, 12, 14}, new int[] {0, 180, 0, 220});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateWaveform(new long[] {0, 8, 12, 10}, new int[] {0, 95, 0, 120});
        } else {
            vibrateWaveform(new long[] {0, 9, 14, 12}, new int[] {0, 140, 0, 175});
        }
    }

    private void playGoodNotDone(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 8, 10, 10}, new int[] {0, 110, 0, 160});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateOneShot(8, 85);
        } else {
            vibrateWaveform(new long[] {0, 7, 10, 9}, new int[] {0, 95, 0, 120});
        }
    }

    private void playBadAvoided(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 8, 8, 14}, new int[] {0, 145, 0, 225});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateWaveform(new long[] {0, 7, 10, 10}, new int[] {0, 90, 0, 120});
        } else {
            vibrateWaveform(new long[] {0, 8, 10, 12}, new int[] {0, 125, 0, 175});
        }
    }

    private void playBadDone(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 16, 18, 14}, new int[] {0, 215, 0, 165});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateOneShot(14, 120);
        } else {
            vibrateWaveform(new long[] {0, 14, 18, 12}, new int[] {0, 160, 0, 130});
        }
    }

    private void playStreak(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 10, 14, 12, 18, 16}, new int[] {0, 170, 0, 185, 0, 210});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateWaveform(new long[] {0, 8, 12, 10, 16, 12}, new int[] {0, 90, 0, 110, 0, 130});
        } else {
            vibrateWaveform(new long[] {0, 9, 13, 11, 17, 14}, new int[] {0, 130, 0, 155, 0, 180});
        }
    }

    private void playUndo(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 8, 10, 11}, new int[] {0, 120, 0, 170});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateWaveform(new long[] {0, 6, 10, 8}, new int[] {0, 80, 0, 90});
        } else {
            vibrateWaveform(new long[] {0, 7, 10, 9}, new int[] {0, 105, 0, 120});
        }
    }

    private void playFailure(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 15, 22, 16}, new int[] {0, 200, 0, 170});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateOneShot(14, 120);
        } else {
            vibrateWaveform(new long[] {0, 14, 20, 14}, new int[] {0, 150, 0, 130});
        }
    }

    private void playWarning(String profile) {
        playFailure(profile);
    }

    private void playError(String profile) {
        if (PROFILE_PUNCHY.equals(profile)) {
            vibrateWaveform(new long[] {0, 18, 18, 18, 20, 20}, new int[] {0, 220, 0, 220, 0, 210});
        } else if (PROFILE_SUBTLE.equals(profile)) {
            vibrateWaveform(new long[] {0, 14, 18, 14}, new int[] {0, 130, 0, 120});
        } else {
            vibrateWaveform(new long[] {0, 16, 18, 16, 18, 16}, new int[] {0, 170, 0, 170, 0, 160});
        }
    }

    private void vibrateOneShot(int durationMs, int amplitude) {
        Vibrator vibrator = getVibrator();
        if (vibrator == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(durationMs, clampAmplitude(amplitude)));
        } else {
            vibrator.vibrate(durationMs);
        }
    }

    private void vibrateWaveform(long[] timings, int[] amplitudes) {
        Vibrator vibrator = getVibrator();
        if (vibrator == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int[] safe = new int[amplitudes.length];
            for (int i = 0; i < amplitudes.length; i++) {
                safe[i] = clampAmplitude(amplitudes[i]);
            }
            vibrator.vibrate(VibrationEffect.createWaveform(timings, safe, -1));
            return;
        }

        long total = 0;
        for (long t : timings) total += t;
        vibrator.vibrate(Math.max(12L, total));
    }

    private int clampAmplitude(int amplitude) {
        if (amplitude <= 0) return 0;
        if (amplitude > 255) return 255;
        return amplitude;
    }
}
