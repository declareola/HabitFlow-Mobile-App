import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHabitStore } from "../store/useHabitStore";
import { haptics } from "../hooks/useHaptics";

export const Dashboard: React.FC = () => {
  const {
    sleepScore,
    weeklyFocus,
    habits,
    toggleHabit,
    metrics,
    addGratitude,
    setView,
    
    // New states from store
    showBurnoutRecoveryNotice,
    showMentalHealthEscalation,
    activeAIChat,
    sendCoachMessage,
    timezone,
    userName
  } = useHabitStore();

  const [gratitudeInput, setGratitudeInput] = useState("");
  const [showGratitudeNotification, setShowGratitudeNotification] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Latest metrics log if any
  const latestLog = metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const currentSleep = latestLog ? latestLog.sleepScore : sleepScore;
  const currentWater = latestLog ? latestLog.waterIntake : 2.0;
  const currentMind = latestLog ? latestLog.mindState : "Focus";

  // Calculate flow score dynamically
  const todayDateStr = new Date().toISOString().split("T")[0];
  const habitsDoneCount = habits.filter(h => h.lastDone === todayDateStr).length;
  const totalHabitsCount = habits.length;
  const habitRatio = totalHabitsCount > 0 ? habitsDoneCount / totalHabitsCount : 0.5;
  const calculatedFlowScore = Math.min(100, Math.round(currentSleep * 0.5 + (habitRatio * 40) + 10));

  const handleGratitudeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitudeInput.trim()) return;
    addGratitude(gratitudeInput.trim());
    setGratitudeInput("");
    setShowGratitudeNotification(true);
    setTimeout(() => {
      setShowGratitudeNotification(false);
    }, 4000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    sendCoachMessage(chatInput.trim());
    setChatInput("");
    setTimeout(() => {
      setChatLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Suicide / Crisis Escalation High-Priority Banner */}
      <AnimatePresence>
        {showMentalHealthEscalation && (
          <motion.div
            id="clinical-suicide-hotline-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-[#310003] via-[#4d0006] to-[#120000] border-2 border-[#ffb4ab] text-white space-y-4 shadow-2xl relative"
          >
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-red-600 rounded-xl text-white shrink-0 animate-pulse">
                <span className="material-symbols-outlined text-2xl font-bold">medical_services</span>
              </div>
              <div>
                <span className="font-mono text-xs text-[#ffb4ab] font-bold uppercase tracking-widest block">CRITICAL SAFETY HUMAN ACTION ESCALATION</span>
                <h3 className="text-lg font-bold font-display mt-1">{userName}, you do not have to carry this alone.</h3>
                <p className="text-xs text-[#ffdad6] leading-relaxed mt-1">
                  Our system records indicators of high neurological stress or emotional strain. Under standard psychiatric clinical boundaries, AI coaching has been disabled. 
                  <br className="mb-2" />
                  We urge you to pause work and contact human professional resources right now:
                </p>
                <div className="flex flex-wrap gap-4 mt-3 font-semibold text-xs text-[#ffb4ab]">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">phone</span> USA Hotline: Call/Text 988</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">phone</span> Nigeria: Call +234 811 185 3504</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">language</span> International Crisis Lines: findahelpline.com</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Burnout Recovery Notice Card */}
      <AnimatePresence>
        {showBurnoutRecoveryNotice && (
          <motion.div
            id="burnout-recovery-alert-card"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 1 }}
            className="p-5 rounded-2xl bg-[#93000a]/20 border border-[#ffb4ab]/80 text-[#ffb4ab] flex gap-4 items-start"
          >
            <span className="material-symbols-outlined text-2xl animate-spin text-[#e9c176]">cached</span>
            <div>
              <h4 className="text-sm font-bold font-mono">NEURO-CIRCADIAN BURNOUT RELIEF TRIGGERED</h4>
              <p className="text-xs text-[#e1e3e4] leading-relaxed mt-1">
                Your reported sleep metrics ({currentSleep} rest pts, less than 5.5 hours) indicate severe prefrontal fatigue. 
                Our <strong>Anti-Shame Auto-Scaler</strong> has automatically dialed back active work session targets. 
                Focus on recovery biomakers (hydration and light sunlight walk).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Gratitude notification banner */}
      <AnimatePresence>
        {showGratitudeNotification && (
          <motion.div
            id="gratitude-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-1/2 translate-x-1/2 z-50 bg-[#12533a] border border-[#95d4b3] text-[#95d4b3] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg animate-bounce">check_circle</span>
            <span className="font-medium text-sm">Gratitude lock released. Session XP updated!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Welcome Header Info Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1d2021] to-[#12533a]/25 p-6 rounded-2xl border border-[#8f9194]/10">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3] flex items-center gap-1.5 flex-wrap">
            <span>ACTIVE FOCUS STATUS</span>
            <span className="text-[#8f9194]">•</span>
            <span>ZONE: {timezone}</span>
            <span className="text-[#8f9194]">•</span>
            <span className="flex items-center gap-1 text-[10px] bg-[#95d4b3]/15 px-2 py-0.5 rounded-full text-[#95d4b3] border border-[#95d4b3]/30 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#95d4b3] animate-pulse"></span>
              Offline-Sync Modality Active
            </span>
          </span>
          <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Hello, {userName} ⚡</h1>
          <p className="text-[#c5c6ca] text-sm mt-1">
            Current focal priority: <span className="text-[#e2c185] font-semibold">"{weeklyFocus}"</span>
          </p>
        </div>
        <button
          id="dashboard-start-focus"
          type="button"
          onClick={() => {
            haptics.light();
            setView("timer");
          }}
          className="px-6 py-3 rounded-xl bg-[#95d4b3] hover:bg-[#b1f0ce] text-[#002114] font-bold text-xs tracking-wider flex items-center gap-2 self-start md:self-auto transition-all shadow-md shadow-[#95d4b3]/10 cursor-pointer border-none"
        >
          <span className="material-symbols-outlined font-semibold text-sm">play_arrow</span>
          START ACTIVE FOCUS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Flow Potential Gauges */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#95d4b3]/5 rounded-full blur-2xl"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194]">REALTIME BIOTELEMETRY LOG</span>
                <span className="material-symbols-outlined text-[#95d4b3] text-lg">settings_heart</span>
              </div>
              <h2 className="text-[#e1e3e4] font-semibold text-lg">Flow Potential</h2>
              <p className="text-[#c5c6ca] text-xs mt-1">Anonymized score modeling prefrontal rest levels and hydration.</p>
            </div>

            {/* Circular Gauge */}
            <div className="my-8 flex flex-col items-center justify-center relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="68" stroke="rgba(68, 67, 74, 0.25)" strokeWidth="8" fill="transparent" />
                <circle cx="80" cy="80" r="68" stroke="#95d4b3" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - calculatedFlowScore / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display text-4xl font-extrabold text-[#e1e3e4]">{calculatedFlowScore}%</span>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#95d4b3]">DOPAMINE LEVEL</span>
              </div>
            </div>

            <div className="bg-[#191c1d] rounded-xl p-4 border border-[#44474a]/30">
              <div className="flex gap-2 items-start text-xs">
                <span className="material-symbols-outlined text-[#e9c176] text-sm mt-0.5">wb_sunny</span>
                <p className="text-[#c5c6ca] leading-relaxed">
                  {calculatedFlowScore > 75 
                    ? "Cognitive energy peaks now. High restorative REM sync logged. Ready for deep systems modeling."
                    : "Low resting score. Focus Pomodoro sizes restricted to 25 minutes to prevent anxiety build-up."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Daily Ritual Layout (Morning/Evening Stack) */}
        <div className="lg:col-span-8 flex flex-col justify-between p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#8f9194]">BEHAVIORAL THERAPY ARCHITECTURE</span>
                <h2 className="text-xl font-bold font-display text-[#e1e3e4] mt-0.5">Today's Active Stacks</h2>
              </div>
              <button
                id="dashboard-manage-habits"
                type="button"
                onClick={() => setView("habits")}
                className="text-xs text-[#95d4b3] hover:underline flex items-center gap-1 cursor-pointer font-semibold border-none bg-transparent"
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
                        onClick={() => {
                          toggleHabit(habit.id);
                          if (!completedToday) {
                            haptics.success();
                          } else {
                            haptics.light();
                          }
                        }}
                        className={`mt-0.5 h-6 w-6 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
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
                <span className="font-mono text-xs uppercase tracking-wider text-[#e1e3e4]">Gratitude Journal Protocol (Stress Regulation)</span>
              </div>

              <form onSubmit={handleGratitudeSubmit} className="space-y-3">
                <textarea
                  id="dashboard-gratitude-textarea"
                  rows={2}
                  value={gratitudeInput}
                  onChange={(e) => setGratitudeInput(e.target.value)}
                  placeholder="Record one positive occurrence or social interaction to update nervous system baselines... (Tip: try typing words like 'hopeless' to safe-test escalation protocols)"
                  className="w-full bg-[#111415] border border-[#44474a] rounded-xl p-3 text-xs text-[#e1e3e4] placeholder-[#8f9194] focus:outline-none focus:border-[#e9c176] transition-colors"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8f9194] font-mono">Gratitude writing regulates cognitive fatigue indices.</span>
                  <button
                    id="dashboard-gratitude-btn"
                    type="submit"
                    className="px-4 py-2 bg-[#e9c176] hover:bg-[#ffdea5] text-[#412d00] text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none"
                  >
                    Commit Reflection
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive AI Biorhythm Coach chat container */}
      <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e9c176] text-2xl">psychology_alt</span>
            <div>
              <h3 className="text-md font-bold text-[#e1e3e4]">AI Biorhythm Coach</h3>
              <span className="text-[10px] text-[#95d4b3] font-mono block">Zero PII Empathic Cognitive Feedback Tunnel</span>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded bg-[#95d4b3]/10 text-[#95d4b3] font-mono">REST ENHANCEMENT ENGINE</span>
        </div>

        {/* Chat window */}
        <div className="h-64 overflow-y-auto bg-[#111415]/80 rounded-xl p-4 border border-[#44474a]/30 space-y-3 relative">
          {activeAIChat.map((msg) => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
              <div className={`p-1 w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                msg.role === "user" ? "bg-[#e9c176]/20 text-[#e9c176]" : "bg-[#95d4b3]/20 text-[#95d4b3]"
              }`}>
                {msg.role === "user" ? "👤" : "🤖"}
              </div>
              <div className={`p-3 rounded-xl text-xs space-y-1 ${
                msg.role === "user" 
                  ? "bg-[#e9c176]/15 text-[#e9c176]" 
                  : "bg-[#1d2021] text-[#c5c6ca] border border-[#323536]"
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <span className="block text-[8px] text-[#8f9194] text-right font-mono">
                  {msg.role === "user" ? "You" : "Coach"} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="p-1 w-6 h-6 rounded-lg bg-[#95d4b3]/25 text-[#95d4b3] flex items-center justify-center text-xs shrink-0 animate-bounce">
                🤖
              </div>
              <div className="p-3 rounded-xl bg-[#1d2021] border border-[#323536] text-[10px] text-[#8f9194] font-mono">
                Coach is analyzing biological records...
              </div>
            </div>
          )}
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            id="coach-chat-input-field"
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask the coach: 'I am tired' or 'why avoid slacks in morning?'..."
            className="flex-1 bg-[#111415] border border-[#44474a] rounded-xl p-3 text-xs text-[#e1e3e4] focus:outline-none focus:border-[#95d4b3] placeholder-[#8f9194]"
          />
          <button
            id="coach-send-prompt-btn"
            type="submit"
            className="px-5 py-3 rounded-xl bg-[#95d4b3] hover:bg-[#b1f0ce] text-[#002114] font-bold text-xs cursor-pointer border-none flex items-center gap-1 shrink-0"
          >
            Send Prompt
            <span className="material-symbols-outlined text-[10px]">send</span>
          </button>
        </form>
      </div>

      {/* Biological Markers Footer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Rest Card */}
        <div className="p-5 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 flex items-center gap-4">
          <div className="p-3 bg-[#111415] rounded-xl text-[#95d4b3]">
            <span className="material-symbols-outlined text-2xl">bedtime</span>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8f9194]">Sleep Performance</span>
            <h3 className="font-display text-2xl font-bold text-[#e1e3e4]">{currentSleep} <span className="text-xs text-[#c5c6ca]">points</span></h3>
            <span className="text-[10px] text-[#95d4b3] flex items-center gap-0.5 font-mono">
              Sleep Hours: {latestLog ? latestLog.sleepHours : 7.4}h
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
            <button 
              type="button" 
              className="text-[10px] text-blue-400 flex items-center gap-1 cursor-pointer hover:underline border-none bg-transparent font-bold p-0 font-mono" 
              onClick={() => {
                haptics.light();
                setView("logger");
              }}
            >
              Log Water Entry
              <span className="material-symbols-outlined text-[10px]">add_circle</span>
            </button>
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
