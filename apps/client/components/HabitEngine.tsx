import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHabitStore } from "../store/useHabitStore";

export const HabitEngine: React.FC = () => {
  const {
    habits,
    addHabit,
    deleteHabit,
    scaleDownHabit
  } = useHabitStore();

  // New habit form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"work" | "wellness" | "mind">("work");
  const [frequency, setFrequency] = useState("Daily");
  const [step1, setStep1] = useState("");
  const [step2, setStep2] = useState("");
  const [step3, setStep3] = useState("");
  const [errorText, setErrorText] = useState("");

  const [showBriefing, setShowBriefing] = useState(true);
  const [briefingAccepted, setBriefingAccepted] = useState(false);

  // Check if "Morning Writing & Structure" (h1) is in the local list
  const morningWritingHabit = habits.find(h => h.id === "h1" || h.title.includes("Writing"));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !step1.trim() || !step2.trim() || !step3.trim()) {
      setErrorText("Please fill out all formulation steps!");
      setTimeout(() => setErrorText(""), 4000);
      return;
    }

    addHabit({
      title: title.trim(),
      category,
      isActive: true,
      frequency,
      step1: step1.trim(),
      step2: step2.trim(),
      step3: step3.trim()
    });

    // Reset fields
    setTitle("");
    setStep1("");
    setStep2("");
    setStep3("");
    setErrorText("");
  };

  const handleBriefingAccept = () => {
    if (morningWritingHabit) {
      scaleDownHabit(
        morningWritingHabit.id,
        "Open laptop on my desk",
        "Write exactly 1 sentence on current strategy",
        "Take a slow refreshing sip of premium tea"
      );
    }
    setBriefingAccepted(true);
    setTimeout(() => {
      setShowBriefing(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">STACKING BLUEPRINT ENGINE</span>
          <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Behavioral Design</h1>
        </div>
      </div>

      {/* 1. Recovery Briefing Card */}
      <AnimatePresence>
        {showBriefing && morningWritingHabit && (
          <motion.div
            id="recovery-briefing-banner"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -25 }}
            transition={{ duration: 0.4 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-[#261900] To-[#111415] border border-[#e9c176]/30 relative overflow-hidden"
          >
            {/* Corner Light Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#e9c176]/10 rounded-full blur-2xl"></div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#e9c176]/20 rounded-xl text-[#e9c176] shrink-0">
                <span className="material-symbols-outlined text-2xl">auto_fix_high</span>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#e9c176] tracking-wider uppercase">RECOVERY & MERCY MODE ENGAGED</span>
                  <button 
                    id="recovery-dismiss-btn"
                    type="button"
                    onClick={() => setShowBriefing(false)}
                    className="text-[#8f9194] hover:text-[#e1e3e4] cursor-pointer bg-transparent border-none"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <h3 className="text-md font-bold text-[#e1e3e4]">Life happens. You missed 2 days on "{morningWritingHabit.title}".</h3>
                <p className="text-xs text-[#c5c6ca] leading-relaxed max-w-2xl">
                  Avoiding shame loops is critical. Behavior loops break when friction is too high. 
                  Would you like to temporarily auto-scale this habit down to a <strong>5-minute microstack</strong> to lower cognitive resistance?
                </p>

                {briefingAccepted ? (
                  <div className="text-xs text-[#95d4b3] font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    Micro-scale parameters applied. Anchor point changed. Let's restart the loop with no resistance!
                  </div>
                ) : (
                  <button
                    id="recovery-accept-btn"
                    type="button"
                    onClick={handleBriefingAccept}
                    className="py-2.5 px-5 bg-[#e9c176] hover:bg-[#ffdea5] text-[#412d00] font-bold text-xs rounded-xl flex items-center gap-2 transition-transform transform active:scale-98 cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined text-xs">offline_bolt</span>
                    YES, APPLY 1-TAP ADJUSTMENT (5 MINS BASELINE)
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Setup */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <div className="flex items-center gap-2 mb-4 text-[#95d4b3]">
              <span className="material-symbols-outlined">add_circle_outline</span>
              <h3 className="text-lg font-bold font-display text-[#e1e3e4]">Formulate Stacking Step</h3>
            </div>

            {errorText && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/40 text-red-400 text-xs font-semibold">
                {errorText}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="habit-title" className="block text-[10px] font-mono text-[#8f9194] uppercase tracking-wider mb-1">
                  Habit Title
                </label>
                <input
                  id="habit-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep Work block, Sunset reading..."
                  className="w-full bg-[#111415] border border-[#44474a] rounded-xl p-3 text-sm text-[#e1e3e4] focus:outline-none focus:border-[#95d4b3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="habit-category" className="block text-[10px] font-mono text-[#8f9194] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    id="habit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#111415] border border-[#44474a] rounded-xl p-3 text-xs text-[#e1e3e4] focus:outline-none focus:border-[#95d4b3] cursor-pointer"
                  >
                    <option value="work">Work Productivity</option>
                    <option value="wellness">Physical Wellness</option>
                    <option value="mind">Mindfulness / Zen</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="habit-frequency" className="block text-[10px] font-mono text-[#8f9194] uppercase tracking-wider mb-1">
                    Frequency
                  </label>
                  <select
                    id="habit-frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-[#111415] border border-[#44474a] rounded-xl p-3 text-xs text-[#e1e3e4] focus:outline-none focus:border-[#95d4b3] cursor-pointer"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-[#111415] rounded-xl border border-[#44474a]/40 space-y-3">
                <span className="font-mono text-[9px] text-[#e9c176] uppercase tracking-widest block mb-1">BEHAVIOR STACK FORMULA</span>
                
                <div>
                  <span className="text-[10px] font-mono text-[#8f9194] block mb-1">
                    STEP 1: ANCHOR HABIT (AFTER I...)
                  </span>
                  <input
                    id="habit-step1"
                    type="text"
                    required
                    value={step1}
                    onChange={(e) => setStep1(e.target.value)}
                    placeholder="e.g. pour my breakfast tea..."
                    className="w-full bg-[#1d2021] border border-[#44474a]/50 rounded-lg p-2.5 text-xs text-[#e1e3e4] focus:outline-none focus:border-[#95d4b3]"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#8f9194] block mb-1">
                    STEP 2: TARGET ROUTINE (I WILL...)
                  </span>
                  <input
                    id="habit-step2"
                    type="text"
                    required
                    value={step2}
                    onChange={(e) => setStep2(e.target.value)}
                    placeholder="e.g. write top priority for 15 mins..."
                    className="w-full bg-[#1d2021] border border-[#44474a]/50 rounded-lg p-2.5 text-xs text-[#e1e3e4] focus:outline-none focus:border-[#95d4b3]"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#8f9194] block mb-1">
                    STEP 3: SENSORY REWARD (REWARD...)
                  </span>
                  <input
                    id="habit-step3"
                    type="text"
                    required
                    value={step3}
                    onChange={(e) => setStep3(e.target.value)}
                    placeholder="e.g. enjoy a small organic dark chocolate..."
                    className="w-full bg-[#1d2021] border border-[#44474a]/50 rounded-lg p-2.5 text-xs text-[#e1e3e4] focus:outline-none focus:border-[#95d4b3]"
                  />
                </div>
              </div>

              <button
                id="habit-submit-form"
                type="submit"
                className="w-full py-3 bg-[#95d4b3] hover:bg-[#b1f0ce] text-[#002114] font-bold text-sm rounded-xl transition-all cursor-pointer border-none"
              >
                Incorporate Custom Stack
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Stacks Listing */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8f9194]">CURRENT ACTIVE ARCHITECTURES</span>
            <h3 className="text-xl font-bold text-[#e1e3e4] mt-1 mb-4">Formulated Routines</h3>

            <div className="space-y-4">
              {habits.map((h) => (
                <div
                  key={h.id}
                  id={`habit-stack-card-${h.id}`}
                  className="p-4 rounded-xl border border-[#44474a]/30 bg-[#191c1d]/60 flex items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#e1e3e4]">{h.title}</h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#323536] text-[#c5c6ca]">{h.frequency}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs pt-1 border-t border-[#44474a]/20">
                      <div className="p-2 rounded bg-[#111415]/75">
                        <span className="font-mono text-[8px] text-[#e9c176] block mb-0.5">AFTER I:</span>
                        <span className="text-[#c5c6ca] text-[11px] leading-tight">{h.step1}</span>
                      </div>
                      <div className="p-2 rounded bg-[#111415]/75">
                        <span className="font-mono text-[8px] text-[#95d4b3] block mb-0.5">I WILL:</span>
                        <span className="text-[#c5c6ca] text-[11px] leading-tight">{h.step2}</span>
                      </div>
                      <div className="p-2 rounded bg-[#111415]/75">
                        <span className="font-mono text-[8px] text-[#e1e3e4] block mb-0.5">REWARD:</span>
                        <span className="text-[#c5c6ca] text-[11px] leading-tight">{h.step3}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#95d4b3]">
                        <span className="material-symbols-outlined text-sm">local_fire_department</span>
                        <span>{h.streakCount} day streak</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8f9194]">Category: {h.category}</span>
                    </div>
                  </div>

                  <button
                    id={`habit-delete-btn-${h.id}`}
                    type="button"
                    onClick={() => deleteHabit(h.id)}
                    className="p-2 text-[#ffb4ab] bg-[#93000a]/10 hover:bg-[#93000a]/30 rounded-lg hover:text-[#ffdad6] transition-colors cursor-pointer self-start border-none"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Philosophy Banner */}
          <div className="p-6 rounded-2xl bg-[#1d2021]/40 border border-[#8f9194]/10 flex gap-4 items-center">
            <span className="material-symbols-outlined text-3xl text-[#e9c176]">forum</span>
            <div>
              <p className="text-xs italic text-[#c5c6ca] leading-relaxed">
                "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
              </p>
              <span className="text-[9px] font-mono uppercase text-[#e9c176] tracking-wider block mt-1">— Aristotle, Nicomachean Ethics</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
