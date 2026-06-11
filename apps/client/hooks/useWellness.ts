import { useMemo } from "react";
import { useHabitStore } from "../store/useHabitStore";

export function useWellness() {
  const metrics = useHabitStore((state) => state.metrics);
  const sleepScore = useHabitStore((state) => state.sleepScore);
  const logWellness = useHabitStore((state) => state.logWellness);

  // Derive running averages or weekly achievements
  const wellnessSummary = useMemo(() => {
    if (metrics.length === 0) {
      return {
        avgSleepScore: 0,
        avgWaterIntake: 0,
        sleepStability: "Stable",
      };
    }

    const totalSleep = metrics.reduce((acc, curr) => acc + curr.sleepScore, 0);
    const totalWater = metrics.reduce((acc, curr) => acc + curr.waterIntake, 0);
    const avgSleep = Math.round(totalSleep / metrics.length);
    const avgWater = Number((totalWater / metrics.length).toFixed(2));

    let stability = "Stable";
    if (avgSleep < 70) {
      stability = "Impaired Sleep Debt";
    } else if (avgSleep > 85) {
      stability = "Optimal Regeneration";
    }

    return {
      avgSleepScore: avgSleep,
      avgWaterIntake: avgWater,
      sleepStability: stability,
    };
  }, [metrics]);

  const submitLog = (sleepScore: number, sleepHours: number, waterIntake: number, mindState: "Focus" | "Calm" | "Nervous" | "Tired") => {
    logWellness({
      sleepScore,
      sleepHours,
      waterIntake,
      mindState,
    });
  };

  return {
    currentSleepScore: sleepScore,
    metrics,
    wellnessSummary,
    submitLog,
  };
}
