import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FocusSession } from "../types";

interface FocusTimerProps {
  weeklyFocus: string;
  onSessionComplete: (session: Omit<FocusSession, "id" | "date">) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ weeklyFocus, onSessionComplete }) => {
  const [duration, setDuration] = useState<number>(25); // in minutes
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // in seconds
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundscape, setSoundscape] = useState<string>("Deep Ambient Synth");
  const [distractions, setDistractions] = useState<number>(0);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync timeLeft whenever user adjusts the duration slider, if the timer is inactive
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isActive]);

  // Keep track of counts
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinishedSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    setDistractions(0);
  };

  const handleFinishedSession = () => {
    setIsActive(false);
    setShowCompletionModal(true);
    onSessionComplete({
      durationMinutes: duration,
      soundscape,
      completed: true,
      activityName: weeklyFocus
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Radial calculation for dashboard display representation
  const totalSeconds = duration * 60;
  const progressRatio = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
  const dashOffset = 2 * Math.PI * 110 * (1 - progressRatio);

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">SENSORY DEPRIVED CLOCK WORK</span>
        <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Deep Work Tunnel</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stopwatch Visual Circle */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 h-full">
          
          {/* Circular Countdown Tracker */}
          <div className="relative w-64 h-64 flex items-center justify-center my-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="rgba(68, 67, 74, 0.25)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke={isActive ? "#95d4b3" : "#e9c176"}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center select-none text-center">
              <span className="font-mono text-5xl font-extrabold text-[#e1e3e4] tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span id="focal-activity-label" className="text-[10px] uppercase font-mono text-[#95d4b3] tracking-widest mt-2 max-w-[160px] truncate">
                {weeklyFocus}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 mb-4">
            <button
              id="timer-reset-btn"
              type="button"
              onClick={resetTimer}
              className="px-5 py-2.5 rounded-xl border border-[#44474a] text-[#c5c6ca] hover:bg-[#323536]/30 text-xs font-semibold cursor-pointer transition-colors"
            >
              Reset
            </button>

            <button
              id="timer-play-pause-btn"
              type="button"
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-sm cursor-pointer transition-all shadow-md ${
                isActive 
                  ? "bg-[#ffb4ab] border border-[#ffb4ab]/30 text-[#690005]" 
                  : "bg-[#95d4b3] text-[#002114]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isActive ? "pause" : "play_arrow"}
              </span>
              {isActive ? "PAUSE TUNNEL" : "INITIATE FOCUS"}
            </button>

            <button
              id="timer-force-complete-btn"
              type="button"
              onClick={handleFinishedSession}
              className="px-5 py-2.5 rounded-xl bg-[#12533a]/30 border border-[#95d4b3]/30 text-[#95d4b3] text-xs font-semibold hover:bg-[#12533a]/55 cursor-pointer transition-colors"
            >
              Complete
            </button>
          </div>
        </div>

        {/* Right Column: Settings & soundscapes */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Duration controller slider */}
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block">SESSION TUNING</span>
            <h3 className="text-md font-bold text-[#e1e3e4] mt-0.5 mb-4">Duration setting</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#c5c6ca] font-mono">Focal Length</span>
                <span className="font-bold text-[#e9c176] text-sm">{duration} minutes</span>
              </div>
              <input
                id="timer-duration-slider"
                type="range"
                min="5"
                max="90"
                step="5"
                disabled={isActive}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-[#e9c176] bg-[#323536] h-1 rounded-lg cursor-pointer disabled:opacity-40"
              />
              <span className="text-[10px] text-[#8f9194] italic block leading-relaxed">
                {isActive && "Duration lock engaged during active session."}
              </span>
            </div>
          </div>

          {/* Soundscapes selection */}
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block mb-3">SYNTHETIC SOUNDSCAPES</span>
            
            <div className="space-y-2">
              {[
                { name: "Deep Ambient Synth", desc: "Slight low-frequency drone triggers deep alpha wave cohesion." },
                { name: "Celestial White Noise", desc: "Ambient high-altitude cosmic rain sounds filter environment clutters." },
                { name: "Organic Silence", desc: "Unmodulated analog silence blocks sensory distractions." },
              ].map((sound) => (
                <button
                  key={sound.name}
                  id={`soundscape-btn-${sound.name.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => setSoundscape(sound.name)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    soundscape === sound.name
                      ? "border-[#95d4b3] bg-[#12533a]/30 text-[#95d4b3]"
                      : "border-[#44474a]/30 bg-[#191c1d]/60 text-[#c5c6ca] hover:border-[#8f9194]/40"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span>{sound.name}</span>
                    {soundscape === sound.name && (
                      <span className="material-symbols-outlined text-xs">volume_up</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8f9194] font-normal leading-normal">{sound.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Distractions Logging card */}
          <div className="p-5 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 flex items-center justify-between">
            <div>
              <span className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider block">ATTENTION STRAIN</span>
              <h4 className="text-sm font-bold text-[#e1e3e4] mt-0.5">Distractions Counter</h4>
              <p className="text-[10px] text-[#c5c6ca] mt-1 leading-relaxed">
                Log instances when your mind drifted or you picked up your smartphone.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-center font-mono py-1 px-3 bg-[#111415] rounded-lg border border-[#44474a]/50">
                <span className="text-sm font-bold text-[#ffb4ab]">{distractions}</span>
              </div>
              <button
                id="flag-distraction-btn"
                type="button"
                onClick={() => setDistractions((prev) => prev + 1)}
                className="p-2.5 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] hover:bg-[#93000a]/40 transition-colors text-xs font-bold cursor-pointer"
              >
                FLAG DISTRESSION
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Completion Modal / Layer overlay trigger */}
      <AnimatePresence>
        {showCompletionModal && (
          <div className="fixed inset-0 bg-[#0c0f10]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              id="completion-modal-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#1d2021] border border-[#95d4b3]/40 p-6 rounded-2xl text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-[-50px] right-[-50px] w-28 h-28 bg-[#95d4b3]/10 rounded-full blur-2xl"></div>

              <div className="mx-auto w-16 h-16 bg-[#12533a]/40 border border-[#95d4b3] rounded-full flex items-center justify-center text-[#e9c176] mb-4 glow-secondary">
                <span className="material-symbols-outlined text-4xl">emoji_events</span>
              </div>

              <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3] block">EPISODE RECORDED</span>
              <h3 className="font-display text-2xl font-black text-[#e1e3e4] mt-1">Excellent Focus, Alex!</h3>
              
              <div className="p-4 bg-[#111415] rounded-xl my-4 text-xs space-y-2 border border-[#44474a]/30">
                <p className="text-[#c5c6ca]">Focal Task: <strong className="text-[#e1e3e4]">"{weeklyFocus}"</strong></p>
                <p className="text-[#c5c6ca]">Elapsed: <strong>{duration} minutes</strong></p>
                <p className="text-[#c5c6ca]">Lapse logs: <strong className="text-red-400">{distractions} times</strong></p>
              </div>

              <div className="text-[#e9c176] font-bold text-md mb-6 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">offline_bolt</span>
                <span>GRANTING +850 EXPERIENCE POINTS (XP)</span>
              </div>

              <button
                id="close-completion-modal-btn"
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-3 bg-[#95d4b3] hover:bg-[#b1f0ce] text-[#002114] font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-[#95d4b3]/15"
              >
                Return to Command Center
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
