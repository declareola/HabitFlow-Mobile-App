import React, { useState } from "react";
import { motion } from "motion/react";
import { MetricLog } from "../types";

interface WellnessLoggerProps {
  onLogSubmit: (log: Omit<MetricLog, "id" | "date">) => void;
  latestLog: MetricLog | null;
}

export const WellnessLogger: React.FC<WellnessLoggerProps> = ({ onLogSubmit, latestLog }) => {
  // Local temporary staging states
  const [waterAmount, setWaterAmount] = useState<number>(latestLog ? latestLog.waterIntake : 2.0); // Liters
  const [sleepValue, setSleepValue] = useState<number>(latestLog ? latestLog.sleepScore : 80); // Sleep score
  const [sleepHrs, setSleepHrs] = useState<number>(latestLog ? latestLog.sleepHours : 7.2);
  const [mindState, setMindState] = useState<"Focus" | "Calm" | "Nervous" | "Tired">(latestLog ? latestLog.mindState : "Focus");
  const [gratitudeText, setGratitudeText] = useState("");
  const [beverage, setBeverage] = useState<string>("Mineral Water");

  const [notification, setNotification] = useState<string | null>(null);

  const incrementWater = () => {
    setWaterAmount((prev) => Math.min(4.0, parseFloat((prev + 0.25).toFixed(2))));
  };

  const decrementWater = () => {
    setWaterAmount((prev) => Math.max(0.0, parseFloat((prev - 0.25).toFixed(2))));
  };

  // Convert water amount to percentage of daily goal (2.5L target)
  const targetWater = 2.5;
  const waterPercent = Math.min(100, Math.round((waterAmount / targetWater) * 100));

  const handleLogFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogSubmit({
      sleepScore: sleepValue,
      sleepHours: sleepHrs,
      waterIntake: waterAmount,
      mindState,
      gratitudeText: gratitudeText.trim() ? gratitudeText.trim() : undefined
    });

    setNotification("Metrics captured successfully! Your biological balance dashboards have synchronized.");
    setGratitudeText("");
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Compute background sky color based on sleep quality score (twilight to cosmos stars)
  const getSkyColorStyle = () => {
    if (sleepValue < 50) return "from-[#111415] to-[#261900]"; // Exhausted brown morning sky
    if (sleepValue < 75) return "from-[#111415] to-[#12533a]/40"; // Mild green rest sky
    return "from-[#0c0f10] via-[#1a1c1e] to-[#12533a]/30"; // Beautiful deep starry night sky gradient
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">CHRONOBIOLOGY LOG BOOK</span>
        <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Biomarker Entry</h1>
      </div>

      {notification && (
        <motion.div
          id="logger-success-toast"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="p-4 rounded-xl bg-[#12533a] border border-[#95d4b3] text-[#95d4b3] text-sm text-center font-medium shadow-lg"
        >
          {notification}
        </motion.div>
      )}

      <form onSubmit={handleLogFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Liquid Consumptions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block mb-2">HYDRATION TRACKER</span>
            <h3 className="text-xl font-bold text-[#e1e3e4] mb-4">Fluid Consumption</h3>

            {/* Custom Interactive Liquid Wave Filling Bowl */}
            <div className="flex flex-col items-center justify-center py-6">
              <div 
                id="liquid-wave-container"
                className="relative w-40 h-40 rounded-full border-4 border-[#323536] overflow-hidden flex items-center justify-center bg-[#111415]"
              >
                {/* Wavy filling water element */}
                <div 
                  style={{ bottom: `${waterPercent - 100}%` }}
                  className="absolute left-1/2 w-[300px] h-[300px] bg-gradient-to-t from-blue-600/60 to-blue-400/80 rounded-[42%] translate-x-[-50%] wave-fill transition-all duration-700 pointer-events-none"
                ></div>

                {/* Liters Text */}
                <div className="z-10 text-center flex flex-col items-center select-none">
                  <span className="text-[#e1e3e4] font-display text-3xl font-extrabold">{waterAmount}L</span>
                  <span className="text-[10px] uppercase font-mono text-[#c5c6ca]">{waterPercent}% of target</span>
                </div>
              </div>

              {/* Incrementor buttons */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  id="fluid-decrement-btn"
                  type="button"
                  onClick={decrementWater}
                  className="w-10 h-10 rounded-full bg-[#1d2021] hover:bg-[#323536] border border-[#44474a] text-[#e1e3e4] flex items-center justify-center font-bold text-lg select-none transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <div className="text-center">
                  <span className="text-xs text-[#8f9194] font-mono block">Log Cup Size</span>
                  <span className="text-xs font-bold text-[#95d4b3]">+250 ml</span>
                </div>
                <button
                  id="fluid-increment-btn"
                  type="button"
                  onClick={incrementWater}
                  className="w-10 h-10 rounded-full bg-[#12533a]/45 hover:bg-[#12533a] border border-[#95d4b3]/40 text-[#95d4b3] flex items-center justify-center font-bold text-lg select-none transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            {/* Beverage Selector Option items */}
            <div className="mt-4 pt-4 border-t border-[#44474a]/40">
              <span className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider block mb-2">BEVERAGE PARAMETER</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["Mineral Water", "Gyokuro Green Tea", "Black Coffee", "Salt Electrolytes"].map((bev) => (
                  <button
                    key={bev}
                    id={`bev-btn-${bev.replace(/\s+/g, '-').toLowerCase()}`}
                    type="button"
                    onClick={() => setBeverage(bev)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      beverage === bev
                        ? "border-[#95d4b3] bg-[#12533a]/30 text-[#95d4b3]"
                        : "border-[#44474a]/40 bg-[#191c1d]/65 text-[#c5c6ca] hover:border-[#8f9194]/40"
                    }`}
                  >
                    {bev}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Starry Sleep assessment slider & Mood */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-6 rounded-2xl bg-gradient-to-b ${getSkyColorStyle()} border border-[#8f9194]/10 transition-all duration-500 relative overflow-hidden`}>
            
            {/* Ambient Star Sparkles (only shown if high sleep score) */}
            {sleepValue > 70 && (
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-4 left-6 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-12 right-24 w-1.5 h-1.5 bg-yellow-100 rounded-full animate-pulse"></div>
                <div className="absolute bottom-16 left-28 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-20 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block">CIRCADIAN SLEEP PROFILE</span>
                <h3 className="text-xl font-bold text-[#e1e3e4] mt-0.5">Sleep Quality assessment</h3>
              </div>
              <span className="material-symbols-outlined text-[#e9c176] text-2xl">bedtime</span>
            </div>

            {/* Slider 1: Sleep Score (0 - 100) */}
            <div className="space-y-2 my-5">
              <div className="flex justify-between text-xs">
                <span className="text-[#c5c6ca] font-medium font-mono">Calculated Rest Score</span>
                <span className="text-[#95d4b3] font-bold font-mono text-sm">{sleepValue} points</span>
              </div>
              <input
                id="sleep-score-range-slider"
                type="range"
                min="0"
                max="100"
                value={sleepValue}
                onChange={(e) => setSleepValue(parseInt(e.target.value))}
                className="w-full accent-[#95d4b3] bg-[#323536] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-[#8f9194]">
                <span>Restless</span>
                <span>Optimal REM sync</span>
              </div>
            </div>

            {/* Slider 2: Hours slept */}
            <div className="space-y-2 my-5">
              <div className="flex justify-between text-xs">
                <span className="text-[#c5c6ca] font-medium font-mono">Rest Hours duration</span>
                <span className="text-blue-400 font-bold font-mono text-sm">{sleepHrs} Hours</span>
              </div>
              <input
                id="sleep-hours-range-slider"
                type="range"
                min="4"
                max="12"
                step="0.1"
                value={sleepHrs}
                onChange={(e) => setSleepHrs(parseFloat(e.target.value))}
                className="w-full accent-blue-400 bg-[#323536] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-4">
            
            {/* Mood selector buttons */}
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block mb-2">PSYCHOLOGICAL SPECTRUM VIBE</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { text: "Focus", icon: "offline_bolt", color: "border-[#e9c176] bg-[#261900]/40 text-[#e9c176]" },
                  { text: "Calm", icon: "filter_vintage", color: "border-[#95d4b3] bg-[#12533a]/30 text-[#95d4b3]" },
                  { text: "Nervous", icon: "grain", color: "border-[#ffb4ab] bg-[#93000a]/20 text-[#ffb4ab]" },
                  { text: "Tired", icon: "bedtime", color: "border-[#87c6a5] bg-[#323536]/50 text-[#c5c6ca]" }
                ].map((item) => (
                  <button
                    key={item.text}
                    id={`mood-btn-${item.text.toLowerCase()}`}
                    type="button"
                    onClick={() => setMindState(item.text as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                      mindState === item.text
                        ? item.color + " scale-102 font-bold"
                        : "border-[#44474a]/40 bg-[#191c1d]/60 text-[#c5c6ca] hover:border-[#8f9194]/40"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Gratitude text and commit button */}
            <div>
              <label htmlFor="wellness-gratitude" className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block mb-2">GRATITUDE REFLECTION (OPTIONAL)</label>
              <input
                id="wellness-gratitude"
                type="text"
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="Log gratitude reflection block to help balance serotonin loops..."
                className="w-full bg-[#111415] border border-[#44474a] rounded-xl p-3 text-xs text-[#e1e3e4] focus:outline-none focus:border-[#e9c176] placeholder-[#8f9194] mb-4"
              />
            </div>

            <button
              id="submit-log-form-btn"
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#95d4b3] to-[#e9c176] text-[#2f3133] font-bold text-sm tracking-wide hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-[#95d4b3]/10"
            >
              SUBMIT SYSTEM METRICS
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
