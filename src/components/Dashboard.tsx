import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Habit, MetricLog } from "../types";

interface DashboardProps {
  sleepScore: number;
  weeklyFocus: string;
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  metrics: MetricLog[];
  onAddGratitude: (text: string) => void;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  sleepScore,
  weeklyFocus,
  habits,
  onToggleHabit,
  metrics,
  onAddGratitude,
  onNavigate
}) => {
  const [gratitudeInput, setGratitudeInput] = useState("");
  const [showGratitudeNotification, setShowGratitudeNotification] = useState(false);

  // Latest metrics log if any
  const latestLog = metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const currentSleep = latestLog ? latestLog.sleepScore : sleepScore;
  const currentWater = latestLog ? latestLog.waterIntake : 2.4;
  const currentMind = latestLog ? latestLog.mindState : "Focus";

  // Calculate flow score dynamically based on habit completion today + sleep score
  const todayDateStr = new Date().toISOString().split("T")[0];
  const habitsDoneCount = habits.filter(h => h.lastDone === todayDateStr).length;
  const totalHabitsCount = habits.length;
  const habitRatio = totalHabitsCount > 0 ? habitsDoneCount / totalHabitsCount : 0.5;
  const calculatedFlowScore = Math.min(100, Math.round(currentSleep * 0.5 + (habitRatio * 40) + 10));

  const handleGratitudeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitudeInput.trim()) return;
    onAddGratitude(gratitudeInput.trim());
    setGratitudeInput("");
    setShowGratitudeNotification(true);
    setTimeout(() => {
      setShowGratitudeNotification(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Gratitude notification banner */}
      <AnimatePresence>
        {showGratitudeNotification && (
          <motion.div
            id="gratitude-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-1/2 translate-x-1/2 z-50 bg-[#12533a] border border-[#95d4b3] text-[#95d4b3] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span className="font-medium text-sm">Gratitude lock released. Session XP updated!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1d2021] to-[#12533a]/20 p-6 rounded-2xl border border-[#8f9194]/10">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">ACTIVE FOCUS STATUS</span>
          <h1 className="font-display text-3xl font-bold text-[#e1e3e4] mt-1">Hello, Alex ⚡</h1>
          <p className="text-[#c5c6ca] text-sm mt-1">
            Current focal priority: <span className="text-[#e9c176] font-semibold">"{weeklyFocus}"</span>
          </p>
        </div>
        <button
          id="dashboard-start-work-btn"
          type="button"
          onClick={() => onNavigate("timer")}
          className="px-6 py-3 rounded-xl bg-[#95d4b3] hover:bg-[#b1f0ce] text-[#002114] font-semibold flex items-center gap-2 self-start md:self-auto transition-all shadow-md shadow-[#95d4b3]/10 hover:scale-102 cursor-pointer"
        >
          <span className="material-symbols-outlined font-semibold">play_arrow</span>
          START ACTIVE FOCUS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: AI Intelligence & Flow Gauges */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#95d4b3]/5 rounded-full blur-2xl"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#8f9194]">AI BIOMARKER INTELLIGENCE</span>
                <span className="material-symbols-outlined text-[#95d4b3] text-lg">cognition</span>
              </div>
              <h2 className="text-[#e1e3e4] font-semibold text-lg">Flow Potential</h2>
              <p className="text-[#c5c6ca] text-xs mt-1">Calculated via sleep depth, caffeine log and circadian timing alignment.</p>
            </div>

            {/* Circular Gauge */}
            <div className="my-6 flex flex-col items-center justify-center relative">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke="rgba(68, 67, 74, 0.25)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Active Score Track */}
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke="#95d4b3"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - calculatedFlowScore / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Inner Numbers */}
              <div className="absolute flex flex-col items-center">
                <span className="font-display text-4xl font-extrabold text-[#e1e3e4]">{calculatedFlowScore}%</span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#95d4b3]">FLOW STATE</span>
              </div>
            </div>

            <div className="bg-[#191c1d] rounded-xl p-4 border border-[#44474a]/30">
              <div className="flex gap-2 items-start text-xs">
                <span className="material-symbols-outlined text-[#e9c176] text-sm mt-0.5">brightness_5</span>
                <p className="text-[#c5c6ca] leading-relaxed">
                  {calculatedFlowScore > 80 
                    ? "Cognitive energy peaks between 10:00 AM and 1:30 PM. Your high sleep score opens strong neurotransmitter availability."
                    : "Neurotransmitter baseline is moderate. Shorten block sizes to 25 minutes to avoid cognitive fatigue strain."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Daily Ritual Layout (Morning/Evening Stack) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#8f9194]">BEHAVIORAL THERAPY ARCHITECTURE</span>
                <h2 className="text-xl font-bold font-display text-[#e1e3e4] mt-0.5">Today's Active Stacks</h2>
              </div>
              <button
                id="dashboard-manage-habits-lnk"
                type="button"
                onClick={() => onNavigate("habits")}
                className="text-xs text-[#95d4b3] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Configure Stacks
                <span className="material-symbols-outlined text-xs">chevron_right</span>
              </button>
            </div>

            {/* List of Habits */}
            <div className="space-y-3">
              {habits.map((habit) => {
                const completedToday = habit.lastDone === todayDateStr;
                return (
                  <div
                    key={habit.id}
                    id={`dashboard-habit-item-${habit.id}`}
                    className={`p-4 rounded-xl border transition-all ${
                      completedToday 
                        ? "border-[#12533a] bg-[#12533a]/10" 
                        : "border-[#44474a]/40 bg-[#191c1d]/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        id={`dashboard-habit-check-${habit.id}`}
                        type="button"
                        onClick={() => onToggleHabit(habit.id)}
                        className={`mt-0.5 h-6 w-6 rounded-md flex items-center justify-center border transition-all ${
                          completedToday 
                            ? "bg-[#95d4b3] border-[#95d4b3] text-[#003824]" 
                            : "border-[#8f9194]/50 hover:border-[#95d4b3]"
                        }`}
                      >
                        {completedToday && (
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-semibold transition-all ${completedToday ? "text-[#95d4b3] line-through opacity-80" : "text-[#e1e3e4]"}`}>
                            {habit.title}
                          </h4>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                            habit.category === "work" 
                              ? "bg-[#1a1c1e] text-[#838486]" 
                              : habit.category === "wellness" 
                              ? "bg-[#12533a]/35 text-[#95d4b3]" 
                              : "bg-[#261900] text-[#e9c176]"
                          }`}>
                            {habit.category}
                          </span>
                        </div>

                        {/* Stacking Steps Preview */}
                        <div className="mt-2 pl-1 border-l-2 border-[#44474a]/40 space-y-1">
                          <p className="text-xs text-[#c5c6ca]/80 flex items-center gap-1">
                            <span className="font-mono text-[9px] text-[#8f9194]">1. AFTER</span> 
                            <span>{habit.step1}</span>
                          </p>
                          <p className="text-xs text-[#c5c6ca]/80 flex items-center gap-1">
                            <span className="font-mono text-[9px] text-[#8f9194]">2. I WILL</span> 
                            <span>{habit.step2}</span>
                          </p>
                          <p className="text-xs text-[#c5c6ca]/80 flex items-center gap-1">
                            <span className="font-mono text-[9px] text-[#8f9194]">3. REWARD</span> 
                            <span>{habit.step3}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Locked Gratitude Journaling */}
            <div className="mt-5 pt-5 border-t border-[#44474a]/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#e9c176] text-lg">lock</span>
                <span className="font-mono text-xs uppercase tracking-wider text-[#e1e3e4]">Gratitude Recovery Journal protocol</span>
              </div>

              {/* Gratitude submission form */}
              <form onSubmit={handleGratitudeSubmit} className="space-y-3">
                <textarea
                  id="dashboard-gratitude-textarea"
                  rows={2}
                  value={gratitudeInput}
                  onChange={(e) => setGratitudeInput(e.target.value)}
                  placeholder="Record one positive occurrence or social interaction to update nervous system baselines..."
                  className="w-full bg-[#111415] border border-[#44474a] rounded-xl p-3 text-xs text-[#e1e3e4] placeholder-[#8f9194] focus:outline-none focus:border-[#e9c176] transition-colors"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8f9194] font-mono">Unlock condition: daily physical markers checked.</span>
                  <button
                    id="dashboard-gratitude-btn"
                    type="submit"
                    className="px-4 py-2 bg-[#e9c176] hover:bg-[#ffdea5] text-[#412d00] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Commit Reflection
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Biological Markers Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Rest Card */}
        <div className="p-5 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 flex items-center gap-4">
          <div className="p-3 bg-[#111415] rounded-xl text-[#95d4b3]">
            <span className="material-symbols-outlined text-2xl">bedtime</span>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8f9194]">Sleep Performance</span>
            <h3 className="font-display text-2xl font-bold text-[#e1e3e4]">{currentSleep} <span className="text-xs text-[#c5c6ca]">points</span></h3>
            <span className="text-[10px] text-[#95d4b3] flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">trending_up</span>
              Restorative balance optimal
            </span>
          </div>
        </div>

        {/* Hydration Card */}
        <div id="hydration-preview-card" className="p-5 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 flex items-center gap-4">
          <div className="p-3 bg-[#111415] rounded-xl text-blue-400">
            <span className="material-symbols-outlined text-2xl">water_drop</span>
          </div>
          <div className="flex-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8f9194]">Liquid Balance</span>
            <h3 className="font-display text-2xl font-bold text-[#e1e3e4]">{currentWater} <span className="text-xs text-[#c5c6ca]">Liters</span></h3>
            <span className="text-[10px] text-blue-400 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => onNavigate("logger")}>
              Log hydration water
              <span className="material-symbols-outlined text-[10px]">add_circle_outline</span>
            </span>
          </div>
        </div>

        {/* State of Mind */}
        <div className="p-5 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 flex items-center gap-4">
          <div className="p-3 bg-[#111415] rounded-xl text-[#e9c176]">
            <span className="material-symbols-outlined text-2xl">psychology</span>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8f9194]">Somatic Vibe</span>
            <h3 className="font-display text-2xl font-bold text-[#e1e3e4]">{currentMind}</h3>
            <span className="text-[10px] text-[#e9c176] flex items-center gap-0.5">
              <span>Nervous spectrum balanced</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
