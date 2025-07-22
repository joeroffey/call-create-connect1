import { useCallback } from "react";
import { ENVIRONMENT } from "@/utils/environment";

// Types for impact style
export type HapticImpactStyle = "light" | "medium" | "heavy";

export function useHaptics() {
  const triggerImpact = useCallback(
    async (style: HapticImpactStyle = "light") => {
      if (!ENVIRONMENT.IS_MOBILE_APP) return;
      try {
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
        let impactStyle = ImpactStyle.Light;
        if (style === "medium") impactStyle = ImpactStyle.Medium;
        if (style === "heavy") impactStyle = ImpactStyle.Heavy;
        await Haptics.impact({ style: impactStyle });
      } catch (err) {
        // Ignore errors on web or if plugin is unavailable
      }
    },
    []
  );
  return { triggerImpact };
} 