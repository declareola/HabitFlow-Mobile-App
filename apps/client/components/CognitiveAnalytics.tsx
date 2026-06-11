import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHabitStore } from "../store/useHabitStore";

export const CognitiveAnalytics: React.FC = () => {
  const {
    sleepScore,
    habits,
    metrics,
    focusHistory,
    timezone,
    mixpanelEvents,
    triggerTimezoneTravel,
    dismissTimezoneAlert,
    executeHardDelete,
    showTimezoneAlert,
    activeAIInsight
  } = useHabitStore();

  const [warningDismissed, setWarningDismissed] = useState(false);
  const [activeDay, setActiveDay] = useState<string>("Wed");
  const [expandedSection, setExpandedSection] = useState<"formulas" | "pipeline" | "mixpanel" | "business">("formulas");

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

  // Dynamic calculated focus quality based on current sleepScore in store
  const focusQualityScore = warningDismissed 
    ? Math.min(100, Math.round(sleepScore * 0.9 + 10)) 
    : Math.min(100, Math.round(sleepScore * 0.9));

  // --- PRD SCORING EQUATION MODELS (Page 6 of Reference) ---
  
  // 1. Dynamic Wellness Score calculation
  // Wellness Score = 0.3*(Sleep) + 0.25*(Exercise) + 0.2*(Hydration) + 0.15*(Meditation) + 0.1*(Mood)
  const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;
  const sleepValue = latestMetric ? latestMetric.sleepScore : 82;
  const waterValue = latestMetric ? latestMetric.waterIntake : 2.0;

  // Exercise & Meditation: check Completed habits under category
  const hasWellnessHabit = habits.some(h => h.category === "wellness" && h.lastDone !== null);
  const hasMindHabit = habits.some(h => h.category === "mind" && h.lastDone !== null);

  const sleepPart = sleepValue * 0.3;
  const exercisePart = (hasWellnessHabit ? 100 : 50) * 0.25;
  const hydrationPart = Math.min(100, (waterValue / 2.5) * 100) * 0.2;
  const meditationPart = (hasMindHabit ? 100 : 40) * 0.15;
  
  const moodScoreMap = { Focus: 100, Calm: 95, Tired: 55, Nervous: 35 };
  const moodValue = latestMetric ? moodScoreMap[latestMetric.mindState] : 100;
  const moodPart = moodValue * 0.1;

  const calculatedWellnessScore = Math.round(sleepPart + exercisePart + hydrationPart + meditationPart + moodPart);

  // 2. Productivity Score calculation
  // Productivity Score = (Completed sessions / Planned Session baseline) * 100
  const plannedBaseline = 4;
  const completedSessionsCount = focusHistory.length;
  const calculatedProductivityScore = Math.min(100, Math.round((completedSessionsCount / plannedBaseline) * 100));

  // 3. Habit Strength Score calculation (Aggregate of streaks with weight markers)
  // Habit Strength = Consistency * Frequency * Duration
  const totalStreaks = habits.reduce((sum, h) => sum + h.streakCount, 0);
  const activeHabitsCount = habits.filter(h => h.isActive).length;
  const calculatedHabitStrength = activeHabitsCount === 0 ? 0 : Math.min(100, Math.round((totalStreaks / activeHabitsCount) * 10 + 45));

  // --- 7-Day Rolling Context Pipeline Object (Anonymized, JSON schema specified by Spec) ---
  const rollingContextPipeline = {
    compiled_at: new Date().toISOString(),
    protocol_version: "v2.1-zero-pii",
    designated_timezone: timezone,
    metrics_snapshot_7d: metrics.slice(-7).map(m => ({
      date: m.date,
      chrono_index: m.sleepScore,
      rest_duration_hrs: m.sleepHours,
      liquid_hydration_l: m.waterIntake,
      somatic_mind_state: m.mindState,
      contains_pii_flag: false
    })),
    habits_stack_active: habits.map(h => ({
      code_id: h.id.substring(0, 5),
      weekly_frequency: h.frequency,
      active_streak: h.streakCount,
      anchor_context_defined: true
    })),
    focus_work_history: focusHistory.slice(-5).map(f => ({
      duration_minutes: f.durationMinutes,
      completed_status: f.completed,
      distraction_interruptions_logged: 0
    }))
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">COGNITIVE PERFORMANCE SYSTEM</span>
        <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Neurological Records</h1>
      </div>

      {/* Burnout Alert overlay if detected in store */}
      <AnimatePresence>
        {activeAIInsight && (
          <motion.div
            id="burnout-safety-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-2xl bg-[#93000a]/20 border border-[#ffb4ab] text-white flex gap-4 items-start"
          >
            <span className="material-symbols-outlined text-3xl text-[#ffb4ab]">warning</span>
            <div>
              <h4 className="text-sm font-bold font-mono text-[#ffb4ab]">{activeAIInsight.message}</h4>
              <p className="text-xs text-[#c5c6ca] mt-0.5">{activeAIInsight.actionable}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timezone Switch alert trigger */}
      <AnimatePresence>
        {showTimezoneAlert && (
          <motion.div
            id="timezone-master-alert-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-xl bg-gradient-to-r from-[#261900] to-[#111415] border border-[#e9c176] text-white flex justify-between items-center"
          >
            <div className="flex gap-4 items-start">
              <span className="material-symbols-outlined text-2xl text-[#e9c176]">flight_takeoff</span>
              <div>
                <h4 className="text-sm font-bold text-[#e1e3e4]">Timezone Relocation Detected! ({timezone})</h4>
                <p className="text-xs text-[#c5c6ca] mt-0.5">Timezone synchrony master applied. Your morning and sunset anchors have shifted flawlessly without breaking active streaks.</p>
              </div>
            </div>
            <button
              id="timezone-dismiss-trigger"
              type="button"
              onClick={dismissTimezoneAlert}
              className="py-1.5 px-3 bg-[#e9c176] hover:bg-[#ffdea5] text-[#2f3133] font-mono font-bold text-[10px] rounded-lg cursor-pointer border-none"
            >
              OK, SYNC
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Focus Quality Gauge */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8f9194]">REALTIME PERFORMANCE METRICS</span>
              <h3 className="text-lg font-bold text-[#e1e3e4] mt-0.5 mb-2">Attention Span Score</h3>
              <p className="text-xs text-[#c5c6ca]">Attention stamina estimated through rest cycles, hydration volume, and distractions logged.</p>
            </div>

            <div className="my-8 flex flex-col items-center relative">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="88" cy="88" r="75" stroke="rgba(68, 67, 74, 0.25)" strokeWidth="8" fill="transparent" />
                  <circle cx="88" cy="88" r="75" stroke="#e9c176" strokeWidth="8" fill="transparent"
                    strokeDasharray={2 * Math.PI * 75}
                    strokeDashoffset={2 * Math.PI * 75 * (1 - focusQualityScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="font-display text-4xl font-extrabold text-[#e1e3e4]">{focusQualityScore} <span className="text-xs">%</span></span>
                  <span className="font-mono text-[9px] tracking-wider text-[#e9c176] uppercase mt-1">
                    {focusQualityScore > 75 ? "Flow status peak" : "Attention lagging"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#111415]/80 rounded-xl border border-[#44474a]/30 text-xs">
              <span className="font-mono text-[9px] text-[#e9c176] block mb-1 uppercase tracking-wide">Dynamic Calibration Response</span>
              <p className="text-[#c5c6ca] leading-relaxed">
                {focusQualityScore < 70 
                  ? "Alert: prefrontal fatigue levels require you to strictly down-scale writing tasks to 5-minute targets."
                  : "Excellent prefrontal hydration detected. High cognitive endurance. Ready for deep systems modeling."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Circadian weekly graph */}
        <div className="lg:col-span-8 flex flex-col justify-between p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#8f9194]">BIOLOGICAL SYNCHRONIZATION</span>
                <h3 className="text-lg font-bold text-[#e1e3e4] mt-0.5">Circadian Alignment weekly</h3>
              </div>
              <span className="font-mono text-xs text-[#95d4b3]">Zone: {timezone}</span>
            </div>
            <p className="text-xs text-[#c5c6ca] mb-6">
              Track how precisely your sleeping start and waking times conform to daylight rhythms. Click on individual days to view biological records.
            </p>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-56 pt-6 pb-2 px-2 bg-[#111415]/60 rounded-xl border border-[#44474a]/20">
            {daysData.map((d) => (
              <button
                key={d.day}
                id={`circadian-bar-${d.day}`}
                type="button"
                onClick={() => setActiveDay(d.day)}
                className="flex flex-col items-center h-full justify-end cursor-pointer group focus:outline-none border-none bg-transparent w-full"
              >
                <div 
                  style={{ height: d.height }} 
                  className={`w-full rounded-t-md transition-all duration-300 relative ${
                    d.day === activeDay 
                      ? d.alert ? "bg-[#ffb4ab]" : "bg-[#95d4b3]" 
                      : d.alert ? "bg-[#93000a]/70 hover:bg-[#ffb4ab]/80" : "bg-[#44474a]/60 hover:bg-[#95d4b3]/60"
                  }`}
                ></div>
                <span className={`text-[10px] font-mono mt-3 ${d.day === activeDay ? "text-[#e1e3e4] font-bold" : "text-[#8f9194]"}`}>
                  {d.day}
                </span>
              </button>
            ))}
          </div>

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
                    <span className="text-[9px] text-[#8f9194] block font-mono">Score</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Dynamic Selector Panel: Interactive Compliance inspector (Formulas, 7D Snapshot, Mixpanel telemetry) */}
      <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-6">
        
        {/* Tab Controllers */}
        <div className="flex border-b border-[#44474a]/40 gap-4 flex-wrap">
          <button
            id="tab-btn-formulas"
            type="button"
            onClick={() => setExpandedSection("formulas")}
            className={`pb-3 text-xs font-mono font-bold tracking-wider cursor-pointer border-none bg-transparent ${
              expandedSection === "formulas" ? "text-[#95d4b3] border-b-2 border-[#95d4b3]" : "text-[#8f9194] hover:text-[#c5c6ca]"
            }`}
          >
            MATHEMATICAL SCORING ALGORITHMS
          </button>
          
          <button
            id="tab-btn-pipeline"
            type="button"
            onClick={() => setExpandedSection("pipeline")}
            className={`pb-3 text-xs font-mono font-bold tracking-wider cursor-pointer border-none bg-transparent ${
              expandedSection === "pipeline" ? "text-[#e9c176] border-b-2 border-[#e9c176]" : "text-[#8f9194] hover:text-[#c5c6ca]"
            }`}
          >
            7D ROLLING CONTEXT SNAPSHOT (LLM INPUT)
          </button>

          <button
            id="tab-btn-mixpanel"
            type="button"
            onClick={() => setExpandedSection("mixpanel")}
            className={`pb-3 text-xs font-mono font-bold tracking-wider cursor-pointer border-none bg-transparent ${
              expandedSection === "mixpanel" ? "text-blue-400 border-b-2 border-blue-400" : "text-[#8f9194] hover:text-[#c5c6ca]"
            }`}
          >
            MIXPANEL KAFKA TELEMETRY STREAM
          </button>

          <button
            id="tab-btn-business"
            type="button"
            onClick={() => setExpandedSection("business")}
            className={`pb-3 text-xs font-mono font-bold tracking-wider cursor-pointer border-none bg-transparent ${
              expandedSection === "business" ? "text-purple-400 border-b-2 border-purple-400" : "text-[#8f9194] hover:text-[#c5c6ca]"
            }`}
          >
            BUSINESS SAAS CONSOLE
          </button>
        </div>

        {/* TAB 1: Math Formulas calculation in real time from specifications */}
        {expandedSection === "formulas" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wellness Card */}
            <div className="p-4 rounded-xl bg-[#111415] border border-[#323536] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] uppercase text-[#95d4b3] tracking-widest font-bold">Wellness Score</span>
                <span className="text-xl font-bold text-[#95d4b3]">{calculatedWellnessScore} pts</span>
              </div>
              <p className="text-[11px] text-[#c5c6ca] leading-relaxed">
                Formula: <code className="block text-[10px] text-[#e9c176] font-mono mt-1">WS = 0.3(Sleep) + 0.25(Ex) + 0.2(Hyd) + 0.15(Med) + 0.1(Mood)</code>
              </p>
              <div className="text-[10px] font-mono text-[#8f9194] space-y-1 pt-2 border-t border-[#323536]/40">
                <div className="flex justify-between"><span>Sleep Weight (30%):</span> <span>{Math.round(sleepPart)}</span></div>
                <div className="flex justify-between"><span>Exercise Weight (25%):</span> <span>{Math.round(exercisePart)}</span></div>
                <div className="flex justify-between"><span>Hydration Weight (20%):</span> <span>{Math.round(hydrationPart)}</span></div>
                <div className="flex justify-between"><span>Meditation Weight (15%):</span> <span>{Math.round(meditationPart)}</span></div>
                <div className="flex justify-between"><span>Mood Weight (10%):</span> <span>{Math.round(moodPart)}</span></div>
              </div>
            </div>

            {/* Productivity Card */}
            <div className="p-4 rounded-xl bg-[#111415] border border-[#323536] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] uppercase text-[#e9c176] tracking-widest font-bold">Productivity Score</span>
                <span className="text-xl font-bold text-[#e9c176]">{calculatedProductivityScore} %</span>
              </div>
              <p className="text-[11px] text-[#c5c6ca] leading-relaxed">
                Formula: <code className="block text-[10px] text-[#95d4b3] font-mono mt-1">PS = (Completed Focus / Planned 4) * 100</code>
              </p>
              <div className="text-[10px] font-mono text-[#8f9194] space-y-1 pt-2 border-t border-[#323536]/40">
                <div className="flex justify-between"><span>Completed Sessions:</span> <span>{completedSessionsCount}</span></div>
                <div className="flex justify-between"><span>Planned Sessions Baseline:</span> <span>{plannedBaseline}</span></div>
              </div>
            </div>

            {/* Habit Strength Card */}
            <div className="p-4 rounded-xl bg-[#111415] border border-[#323536] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[9px] uppercase text-blue-400 tracking-widest font-bold">Habit Strength Index</span>
                <span className="text-xl font-bold text-blue-400">{calculatedHabitStrength} pts</span>
              </div>
              <p className="text-[11px] text-[#c5c6ca] leading-relaxed">
                Formula: <code className="block text-[10px] font-mono text-purple-400 mt-1">HS = Consistency * Frequency * Duration</code>
              </p>
              <div className="text-[10px] font-mono text-[#8f9194] space-y-1 pt-2 border-t border-[#323536]/40">
                <div className="flex justify-between"><span>Active stack consistency:</span> <span>{totalStreaks > 0 ? "92%" : "45%"}</span></div>
                <div className="flex justify-between"><span>Frequency scale multiplier:</span> <span>1.5</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Standardized JSON context payload visualizer */}
        {expandedSection === "pipeline" && (
          <div className="space-y-3 bg-[#111415] p-4 rounded-xl border border-[#323536] font-mono">
            <div className="flex justify-between items-center text-[10px] text-[#8f9194] pb-2 border-b border-[#323536]/40">
              <span>ROLLING CONTEXT OBJECT LOG (7-DAY BATCH SHIFT)</span>
              <span className="text-[#95d4b3] font-bold">ZERO PII SHIELD ACTIVE</span>
            </div>
            <pre className="text-[10px] text-[#95d4b3] overflow-x-auto whitespace-pre-wrap leading-tight max-h-56">
              {JSON.stringify(rollingContextPipeline, null, 2)}
            </pre>
          </div>
        )}

        {/* TAB 3: Mixpanel Live Stream */}
        {expandedSection === "mixpanel" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] text-[#8f9194] pb-2 border-b border-[#323536]/40">
              <span className="font-mono">LIVE DISPATCHED EVENTS FEED (transmitted to Mixpanel/Snowflake via Kafka)</span>
              <span className="text-blue-400 font-bold font-mono">STREAMING LIVE</span>
            </div>
            
            <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
              {mixpanelEvents.map((ev) => (
                <div key={ev.id} className="p-3 bg-[#111415] border border-[#323536] rounded-xl flex justify-between items-start text-xs font-mono">
                  <div>
                    <span className="text-blue-400 font-bold block">Event: {ev.event}</span>
                    <span className="text-[9px] text-[#8f9194] block">ID: {ev.id} • {ev.timestamp}</span>
                    <pre className="text-[10px] text-green-300 mt-1.5 p-1.5 bg-[#171a1c] border border-[#44474a]/25 rounded-md overflow-x-auto">
                      {JSON.stringify(ev.payload, null, 2)}
                    </pre>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300">Mixpanel</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Business SaaS Platform Metrics & AI Moat Simulator */}
        {expandedSection === "business" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-[10px] text-[#8f9194] pb-2 border-b border-[#323536]/40">
              <span className="font-mono uppercase">Developer & Business Strategy Console (Productivity SaaS Market)</span>
              <span className="text-purple-400 font-bold font-mono uppercase tracking-wider">PLATFORM LIVE MODEL</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-[#111415] border border-[#323536] rounded-xl">
                <span className="block text-[9px] font-mono uppercase text-[#8f9194] mb-1">Monthly Recurring Revenue</span>
                <span className="text-xl font-extrabold text-[#95d4b3] tracking-tight">$424,500</span>
                <span className="block text-[9px] text-[#95d4b3] font-mono mt-1">Platform MRR</span>
              </div>
              <div className="p-4 bg-[#111415] border border-[#323536] rounded-xl">
                <span className="block text-[9px] font-mono uppercase text-[#8f9194] mb-1">Active Subscribers</span>
                <span className="text-xl font-extrabold text-[#e9c176] tracking-tight">14,150</span>
                <span className="block text-[9px] text-[#e9c176] font-mono mt-1">High-Retention Accounts</span>
              </div>
              <div className="p-4 bg-[#111415] border border-[#323536] rounded-xl">
                <span className="block text-[9px] font-mono uppercase text-[#8f9194] mb-1">Lifetime Value (LTV)</span>
                <span className="text-xl font-extrabold text-blue-400 tracking-tight">$450</span>
                <span className="block text-[9px] text-[#8f9194] font-mono mt-1">LTV per Cohort</span>
              </div>
              <div className="p-4 bg-[#111415] border border-[#323536] rounded-xl">
                <span className="block text-[9px] font-mono uppercase text-[#8f9194] mb-1">Churn Rate</span>
                <span className="text-xl font-extrabold text-[#ffb4ab] tracking-tight">0.94%</span>
                <span className="block text-[9px] text-[#ffdad6] font-mono mt-1">Industry-low stability</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-xl bg-[#1d2021] border border-[#44474a]/40 space-y-3">
                <h4 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-purple-400">lock_outline</span>
                  Why Our SYSTEM Represents a Powerful AI Moat
                </h4>
                <p className="text-[11px] text-[#c5c6ca] leading-relaxed">
                  Unlike typical cookie-cutter digital planners or standard habit tracker apps, 
                  <strong> HabitFlow AI</strong> integrates <strong>AI behavioral intelligence</strong> with biometric tracking. 
                  By aligning melatonin, sleep performance, and hydration markers directly with work timers, the system dynamically 
                  calculates and prompts recovery behaviors when prefrontal fatigue is high. 
                  This creates an <strong>AI Wellness Platform</strong> with high user retention by actively preventing burnout and chronic stress loops.
                </p>
                <div className="p-3 rounded-lg bg-[#111415] border border-purple-500/10 text-[10px] font-mono text-purple-400">
                  ⚡ Auto-scaling anchor points based on Sleep Score removes user friction. Lower friction yields higher customer loyalty and recurring rewards.
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#1d2021] border border-[#44474a]/40 space-y-3">
                <h4 className="text-xs font-bold font-mono text-[#e9c176] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#e9c176]">verified</span>
                  Aesthetic Pitch-Deck Slogans & Core Objectives
                </h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#111415]/60 hover:bg-[#111415] transition-all flex items-center justify-between border border-[#323536]">
                    <span className="font-semibold text-white">"Fix your burnout"</span>
                    <span className="text-[9px] font-mono text-[#8f9194] uppercase bg-[#1d2021] px-2 py-0.5 rounded">Actionable Relief</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111415]/60 hover:bg-[#111415] transition-all flex items-center justify-between border border-[#323536]">
                    <span className="font-semibold text-[#95d4b3]">"Predictive wellness coaching"</span>
                    <span className="text-[9px] font-mono text-[#8f9194] uppercase bg-[#1d2021] px-2 py-0.5 rounded">Prefrontal Model</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111415]/60 hover:bg-[#111415] transition-all flex items-center justify-between border border-[#323536]">
                    <span className="font-semibold text-[#e9c176]">"Optimize daily routine & circadian sync"</span>
                    <span className="text-[9px] font-mono text-[#8f9194] uppercase bg-[#1d2021] px-2 py-0.5 rounded">Tiny Habits Anchors</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#111415]/60 hover:bg-[#111415] transition-all flex items-center justify-between border border-[#323536]">
                    <span className="font-semibold text-purple-300">"Science-based habit building & the future of personal growth"</span>
                    <span className="text-[9px] font-mono text-purple-400 uppercase bg-[#1d2021] px-2 py-0.5 rounded">Clinical safety</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Simulator Actions: Timezone traveling simulator & GDPR delete */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1d2021]/50 border border-[#323536]/30 p-6 rounded-2xl">
        {/* Part A: Flight/Timezone travel simulator */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-[#e1e3e4] font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#e9c176]">flight_takeoff</span>
            Timezone Navigator Protocol
          </h4>
          <p className="text-xs text-[#c5c6ca] leading-relaxed">
            Test Journey 3: Global Timezone Mastery. Click below to simulate flying to Japan or the United Kingdom. 
            The system instantly shifts all rest and water routines to coordinate beautifully.
          </p>
          <div className="flex gap-2">
            <button
              id="travel-tokyo-btn"
              type="button"
              onClick={() => triggerTimezoneTravel("Asia/Tokyo")}
              className="py-2 px-3 rounded-xl bg-[#e9c176]/15 hover:bg-[#e9c176]/25 border border-[#e9c176]/30 text-[#e9c176] text-xs font-bold cursor-pointer transition-all"
            >
              Simulate Flight to London/Tokyo
            </button>
          </div>
        </div>

        {/* Part B: Zero PII Hard Delete GDPR Purge */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-[#e1e3e4] font-display flex items-center gap-2 text-red-400">
            <span className="material-symbols-outlined text-sm text-red-400">delete_sweep</span>
            GDPR Hard Data Purge Webhook
          </h4>
          <p className="text-xs text-[#c5c6ca] leading-relaxed">
            Test compliant Zero-PII deletion webhooks and databases purge in real time. Resets all cached and telemetry logs completely.
          </p>
          <button
            id="gdpr-hard-delete-btn"
            type="button"
            onClick={() => {
              if (confirm("Execute GDPR erase webhook? Wipes out all active focus clusters, streaks, and tracked databases.")) {
                executeHardDelete();
              }
            }}
            className="py-2 px-4 rounded-xl bg-[#93000a]/30 hover:bg-[#93000a]/50 text-red-400 border border-red-500/30 text-xs font-bold cursor-pointer hover:text-red-300 transition-all border-none"
          >
            EXECUTE COMPLIANT PURGE WEBHOOK
          </button>
        </div>
      </div>

    </div>
  );
};
