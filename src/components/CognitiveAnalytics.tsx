import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CognitiveAnalyticsProps {
  sleepScore: number;
}

export const CognitiveAnalytics: React.FC<CognitiveAnalyticsProps> = ({ sleepScore }) => {
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [activeDay, setActiveDay] = useState<string>("Wed");

  // Circadian alignment mock data weekly
  const daysData = [
    { day: "Mon", score: 82, height: "78%", details: "Regular morning sunlight exposure" },
    { day: "Tue", score: 65, height: "55%", details: "Delayed evening sleep cycle (2h offset)", alert: true },
    { day: "Wed", score: 88, height: "88%", details: "Optimal melatonin onset, no sunset screen usage" },
    { day: "Thu", score: 75, height: "70%", details: "Average balance, slight evening caffeine lag" },
    { day: "Fri", score: 90, height: "92%", details: "High cardiovascular performance during daytime" },
    { day: "Sat", score: 92, height: "95%", details: "Extended deep sleep cycle, zero waking interruptions" },
    { day: "Sun", score: 85, height: "82%", details: "Consistent sleep wake window adhered to" }
  ];

  // Dynamic calculated focus quality
  const focusQualityScore = warningDismissed ? 83 : 75;

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">COGNITIVE PERFORMANCE SYSTEM</span>
        <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Neurological Health</h1>
      </div>

      {/* 1. Warning Bento Alert */}
      <AnimatePresence>
        {!warningDismissed && (
          <motion.div
            id="nervous-strain-alert"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-[#93000a]/20 to-[#111415] border border-[#ffb4ab]/30 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-[#93000a]/30 rounded-xl text-[#ffb4ab] shrink-0">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#ffb4ab] font-bold uppercase tracking-widest">Nervous System Strain Alert</span>
                  <h3 className="text-md font-bold text-[#e1e3e4] mt-0.5">High circadian latency on Tuesday evening.</h3>
                  <p className="text-xs text-[#c5c6ca]/90 leading-relaxed mt-1">
                    Your sleep latency was 42 minutes longer than normal due to melatonin production delays. 
                    Cognitive fatigue coach advocates the <strong>Circadian Relief Protocol</strong> (dim room lights 1h earlier tonight).
                  </p>
                </div>
              </div>

              <button
                id="accept-relief-protocol-btn"
                type="button"
                onClick={() => setWarningDismissed(true)}
                className="py-2.5 px-5 bg-[#ffb4ab] hover:bg-[#ffdad6] text-[#690005] font-bold text-xs rounded-xl transition-all hover:scale-103 cursor-pointer shrink-0 self-start md:self-auto"
              >
                Accept Adjusted Schedule Protocol
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Focus Quality Gauge */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 h-full flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8f9194]">REALTIME PERFORMANCE METRICS</span>
              <h3 className="text-lg font-bold text-[#e1e3e4] mt-0.5 mb-2">Focus Quality</h3>
              <p className="text-xs text-[#c5c6ca]">Composite level calculated through working memory and attention recovery times.</p>
            </div>

            <div className="my-[26px] flex flex-col items-center relative">
              {/* Radial Circle */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="75"
                    stroke="rgba(68, 67, 74, 0.25)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="75"
                    stroke="#e9c176"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 75}
                    strokeDashoffset={2 * Math.PI * 75 * (1 - focusQualityScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="font-display text-4xl font-extrabold text-[#e1e3e4]">{focusQualityScore} <span className="text-xs">/ 100</span></span>
                  <span className="font-mono text-[9px] tracking-wider text-[#e9c176] uppercase mt-1">
                    {focusQualityScore > 80 ? "Optimal focus" : "Sub-optimal balance"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#111415]/80 rounded-xl border border-[#44474a]/30">
              <span className="font-mono text-[9px] text-[#e9c176] block mb-1">COACH COMPLIANCE RECOMMENDATION</span>
              <p className="text-[11px] text-[#c5c6ca] leading-relaxed">
                {focusQualityScore < 80 
                  ? "Take a 45-minute offline rest block immediately after active focus to recharge depleted sensory fields."
                  : "Excellent alignment. You are fit for creative modeling and strategic systems coding."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Circadian alignment Weekly Bar graph */}
        <div className="lg:col-span-8 flex flex-col justify-between p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#8f9194]">BIOLOGICAL SYNCHRONIZATION</span>
                <h3 className="text-lg font-bold text-[#e1e3e4] mt-0.5">Circadian Alignment weekly</h3>
              </div>
              <span className="font-mono text-xs text-[#95d4b3]">Melatonin Baseline: Stable</span>
            </div>
            <p className="text-xs text-[#c5c6ca] mb-6">
              Track how precisely your sleeping start and waking times conform to daylight rhythms. Click on individual days to view biological records.
            </p>
          </div>

          {/* Interactive Bar Chart */}
          <div className="grid grid-cols-7 gap-3 items-end h-56 pt-6 pb-2 px-2 bg-[#111415]/60 rounded-xl border border-[#44474a]/20">
            {daysData.map((d) => (
              <button
                key={d.day}
                id={`circadian-bar-${d.day}`}
                type="button"
                onClick={() => setActiveDay(d.day)}
                className="flex flex-col items-center h-full justify-end cursor-pointer group focus:outline-none"
              >
                <span className="text-[10px] font-mono font-bold text-[#c5c6ca] mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.score}%
                </span>
                
                {/* Bar Visual Column */}
                <div 
                  style={{ height: d.height }} 
                  className={`w-full rounded-t-md transition-all duration-300 relative ${
                    d.day === activeDay 
                      ? d.alert 
                        ? "bg-[#ffb4ab]" 
                        : "bg-[#95d4b3]" 
                      : d.alert 
                        ? "bg-[#93000a]/70 hover:bg-[#ffb4ab]/80" 
                        : "bg-[#44474a]/60 hover:bg-[#95d4b3]/60"
                  }`}
                >
                  {d.alert && (
                    <span className="absolute top-1 left-12 md:left-[40%] translate-x-[-10%] md:translate-x-[-50%] inline-block w-1.5 h-1.5 bg-[#ffb4ab] rounded-full animate-ping"></span>
                  )}
                </div>

                <span className={`text-[10px] font-mono mt-3 ${d.day === activeDay ? "text-[#e1e3e4] font-bold" : "text-[#8f9194]"}`}>
                  {d.day}
                </span>
              </button>
            ))}
          </div>

          {/* Day specific inspection box */}
          <div className="mt-4 p-4 rounded-xl bg-[#191c1d] border border-[#44474a]/30">
            {(() => {
              const selectedObj = daysData.find(d => d.day === activeDay);
              return (
                <div className="flex gap-3 justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#95d4b3]">Inspecting {selectedObj?.day} Performance</span>
                    <p className="text-[#e1e3e4] font-semibold mt-0.5">{selectedObj?.details}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-[#e9c176]">{selectedObj?.score}%</span>
                    <span className="text-[9px] text-[#8f9194] block">Score</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Sleep Latency and correlation elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
          <span className="font-mono text-[9px] text-[#e9c176] uppercase tracking-widest block mb-1">CORRELATION STUDY</span>
          <h4 className="text-md font-bold text-[#e1e3e4] mb-2">Reading Habits vs Sleep Latency</h4>
          <p className="text-xs text-[#c5c6ca] leading-relaxed">
            Correlating evening text-logs. On days you logged reading "Philosophy or non-fiction books", 
            your sleep latency dropped to <span className="text-[#95d4b3] font-semibold">12 minutes average</span> (down from 34 minutes in screen days).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
          <span className="font-mono text-[9px] text-[#95d4b3] uppercase tracking-widest block mb-1">BIO-DECAY PARAMETER</span>
          <h4 className="text-md font-bold text-[#e1e3e4] mb-2">Espresso Timing vs Attention Recovery</h4>
          <p className="text-xs text-[#c5c6ca] leading-relaxed">
            Consuming caffeine past 2:00 PM is correlated with a <span className="text-[#ffb4ab] font-semibold">24% increase</span> in next-day mental task shifts, and increases early morning waking interruptions.
          </p>
        </div>
      </div>
    </div>
  );
};
