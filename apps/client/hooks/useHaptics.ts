import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Robust Haptic and Vibration helper that works across both
 * native Android Capacitor bundles and desktop/mobile web browsers.
 */
export const haptics = {
  /**
   * Triggers a light touch vibration (e.g. key press, tab switch)
   */
  light: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(15);
      }
    }
  },

  /**
   * Triggers a medium touch vibration (e.g. list item toggle)
   */
  medium: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  },

  /**
   * Triggers a heavy touch vibration (e.g. big action start)
   */
  heavy: async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(60);
      }
    }
  },

  /**
   * Triggers a success notification pattern (e.g. completed habit, earned badge!)
   */
  success: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        // Success pattern: two quick bursts
        navigator.vibrate([40, 80, 40]);
      }
    }
  },

  /**
   * Triggers a warning notification pattern (e.g. timer expired, daily limit reached)
   */
  warning: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        // Warning pattern: one short, one long
        navigator.vibrate([60, 120, 150]);
      }
    }
  },

  /**
   * Custom vibration duration
   */
  vibrate: async (durationMs: number) => {
    try {
      await Haptics.vibrate({ duration: durationMs });
    } catch {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(durationMs);
      }
    }
  }
};

/**
 * React hook to easily wire haptics actions into functional components
 */
export function useHaptics() {
  return {
    triggerLight: haptics.light,
    triggerMedium: haptics.medium,
    triggerHeavy: haptics.heavy,
    triggerSuccess: haptics.success,
    triggerWarning: haptics.warning,
    triggerCustom: haptics.vibrate,
  };
}
