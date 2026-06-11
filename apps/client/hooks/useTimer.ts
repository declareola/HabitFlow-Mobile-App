import { useState, useEffect, useRef } from "react";
import { useHabitStore } from "../store/useHabitStore";

export function useTimer(initialDuration = 25) {
  const [minutes, setMinutes] = useState(initialDuration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [soundscape, setSoundscape] = useState("rain");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const addFocusSession = useHabitStore((state) => state.addFocusSession);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Completed!
            completeSession();
          } else {
            setMinutes((m) => m - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, minutes, seconds]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  
  const reset = (newDuration = 25) => {
    setIsActive(false);
    setMinutes(newDuration);
    setSeconds(0);
  };

  const toggleAudio = () => {
    setIsAudioPlaying((prev) => !prev);
  };

  const completeSession = () => {
    setIsActive(false);
    addFocusSession({
      durationMinutes: initialDuration,
      soundscape,
      completed: true,
      activityName: "Focus Marathon Tunnel",
    });
    reset(initialDuration);
  };

  return {
    minutes,
    seconds,
    isActive,
    soundscape,
    setSoundscape,
    isAudioPlaying,
    toggleAudio,
    start,
    pause,
    reset,
    completeSession,
  };
}
