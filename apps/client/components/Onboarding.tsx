import React, { useState } from "react";
import { motion } from "motion/react";
import { useHabitStore } from "../store/useHabitStore";

export const Onboarding: React.FC = () => {
  const completeOnboarding = useHabitStore((state) => state.completeOnboarding);
  const userName = useHabitStore((state) => state.userName);
  
  // Onboarding Stage Control
  // 1 = Goal Selector, 2 = Sleep Baseline, 3 = First Dynamic Insight Chat
  const [stage, setStage] = useState<number>(1);
  const [goal, setGoal] = useState<string>("Reduce Burnout & Regulate Strain");
  const [sleepHrs, setSleepHrs] = useState<number>(6.0);
  const [sleepHappiness, setSleepHappiness] = useState<number>(2); // 1 to 3: Tired, Fair, Refreshed

  const nextStage = () => {
    setStage((prev) => prev + 1);
  };

  const prevStage = () => {
    setStage((prev) => Math.max(1, prev - 1));
  };

  const getCalculatedScore = () => {
    let base = sleepHrs * 12; // e.g. 6 hrs = 72 pts
    if (sleepHappiness === 3) base += 10;
    if (sleepHappiness === 1) base -= 15;
    return Math.min(100, Math.max(20, Math.round(base)));
  };

  const handleLaunch = () => {
    const finalScore = getCalculatedScore();
    const recommendedFocus = sleepHrs < 6.5 
      ? "Sustained Hydration & 1x Gentle 25m Pomodoro Work block (Burnout Alert Level)" 
      : "Strategic product architecture refactor with steady circadian walks";
    
    completeOnboarding(finalScore, recommendedFocus, goal, sleepHrs);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        id="onboarding-card-root"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl p-8 rounded-2xl bg-[#191c1d]/95 border border-[#8f9194]/25 shadow-2xl relative overflow-hidden"
      >
        {/* Shimmer Ambient Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#95d4b3]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#e9c176]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-[#95d4b3]">
            <span className="material-symbols-outlined text-2xl font-bold">local_fire_department</span>
            <span className="font-mono text-xs uppercase tracking-widest font-bold">CIRCADIAN INTERACTIVE INITIALIZATION</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stage === s ? "w-6 bg-[#95d4b3]" : "w-1.5 bg-[#44474a]"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* STAGE 1: Why brings you to HabitFlow */}
        {stage === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#e1e3e4]">Welcome, {userName}.</h1>
              <p className="text-sm text-[#8f9194] mt-1">What primary intention brings you to HabitFlow design panels today?</p>
            </div>

            <div className="space-y-3">
              {[
                { title: "Reduce Burnout & Regulate Strain", desc: "For professionals sleeping < 6.5 hours who need dynamic, shame-free auto-scaling of active habits.", icon: "spa", code: "burnout" },
                { title: "Build Discipline & Double Focus Velocity", desc: "For optimizing work tunnels, morning structure stacks, and maximizing prefrontal productivity scores.", icon: "bolt", code: "discipline" },
                { title: "Track Circadian Rhythm & Sleep Health", desc: "For zero-PII chronobiology records, sunlight timers, and hydration synchronicity logs.", icon: "bedtime", code: "health" }
              ].map((opt) => (
                <button
                  key={opt.title}
                  id={`onboarding-goal-btn-${opt.code}`}
                  type="button"
                  onClick={() => setGoal(opt.title)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex gap-4 items-start ${
                    goal === opt.title
                      ? "border-[#95d4b3] bg-[#12533a]/25 text-[#95d4b3] shadow-md"
                      : "border-[#44474a]/40 bg-[#1d2021]/60 text-[#c5c6ca] hover:border-[#8f9194]/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl mt-0.5">{opt.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold">{opt.title}</h4>
                    <p className="text-xs text-[#8f9194] leading-relaxed mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              id="onboarding-stage1-next"
              type="button"
              onClick={nextStage}
              className="w-full py-3 bg-[#c6c6c9] hover:bg-[#e1e3e4] text-[#2f3133] font-bold text-sm tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
            >
              Continue to assessment
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}

        {/* STAGE 2: sleep last night */}
        {stage === 2 && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs text-[#e9c176] font-bold uppercase tracking-wider block">CHRONO-COGNITIVE BASELINE</span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#e1e3e4] mt-0.5">Let's set your baseline.</h1>
              <p className="text-sm text-[#8f9194] mt-1">To calibrate the dynamic wellness engine, log sleep parameters from last night:</p>
            </div>

            {/* Slider 1: Sleep Hours */}
            <div className="space-y-2 p-4 bg-[#111415]/60 rounded-xl border border-[#44474a]/25">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#c5c6ca]">Rest Duration</span>
                <span className="text-[#95d4b3] font-bold">{sleepHrs} Hours</span>
              </div>
              <input
                id="onboarding-sleep-hours-slider"
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHrs}
                onChange={(e) => setSleepHrs(parseFloat(e.target.value))}
                className="w-full accent-[#95d4b3] bg-[#323536] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-[#8f9194]">
                <span>Restless Sleep</span>
                <span>Optimal restorative sleep</span>
              </div>
            </div>

            {/* Subjective Sleep Vibe */}
            <div className="space-y-3">
              <label className="block text-xs font-mono text-[#8f9194] uppercase tracking-wider">How restorative did your sleep feel?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { text: "Exhausted / Low", level: 1, icon: "sentiment_very_dissatisfied" },
                  { text: "Average / Fair", level: 2, icon: "sentiment_satisfied" },
                  { text: "Fully Restored", level: 3, icon: "sentiment_very_satisfied" }
                ].map((item) => (
                  <button
                    key={item.level}
                    id={`onboarding-rest-level-${item.level}`}
                    type="button"
                    onClick={() => setSleepHappiness(item.level)}
                    className={`p-3 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                      sleepHappiness === item.level
                        ? "border-[#e9c176] bg-[#261900]/30 text-[#e9c176] font-semibold"
                        : "border-[#44474a]/30 bg-[#1d2021]/60 text-[#c5c6ca] hover:border-[#8f9194]/40"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                id="onboarding-stage2-back"
                type="button"
                onClick={prevStage}
                className="w-1/3 py-3 border border-[#44474a] hover:bg-[#323536]/30 text-[#c5c6ca] font-bold text-xs rounded-xl cursor-pointer bg-transparent"
              >
                Back
              </button>
              <button
                id="onboarding-stage2-next"
                type="button"
                onClick={nextStage}
                className="w-2/3 py-3 bg-[#95d4b3] hover:bg-[#b1f0ce] text-[#002114] font-bold text-sm tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
              >
                Calculate dynamic plan
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: Empathic coach diagnostic dialogue */}
        {stage === 3 && (
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs text-[#95d4b3] font-bold uppercase tracking-wider block">FIRST CLINICAL OUTCOME DIAGNOSTIC</span>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#e1e3e4] mt-0.5">Focus Plan Calibrated</h1>
              <p className="text-sm text-[#8f9194] mt-1">Our ethical AI coach has processed your circadian variables:</p>
            </div>

            {/* AI Coach Chat Balloon */}
            <div className="p-5 rounded-2xl bg-[#1d2021] border border-[#e9c176]/30 space-y-4 shadow-inner relative">
              {/* Little speech tail */}
              <div className="absolute top-6 -left-2 w-4 h-4 bg-[#1d2021] border-l border-b border-[#e9c176]/30 rotate-45"></div>
              
              <div className="flex items-center gap-2 text-xs font-mono text-[#e9c176]">
                <span className="material-symbols-outlined text-sm">psychology</span>
                <span>BIORHYTHM COACH (EMPATHIC AGENT)</span>
              </div>

              {sleepHrs < 6.5 ? (
                <p className="text-xs text-[#c5c6ca] leading-relaxed">
                  "Got it, {userName}. Operating on only <strong className="text-[#ffb4ab]">{sleepHrs} sleep hours</strong> triggers prefrontal system strain. 
                  Your deep focus is projected to naturally dip this afternoon. 
                  <br /><br />
                  Under our <strong>Anti-Hustle protocol</strong>, we strictly avoid pushing you into shame-loops of unrealistic goals. 
                  Instead, we have updated your daily targets: Let's focus on 1 gentle walk for solar input and drink 2.0L of water to sustain blood flow. Take it easy today!"
                </p>
              ) : (
                <p className="text-xs text-[#c5c6ca] leading-relaxed">
                  "Got it, {userName}. Operating on a solid <strong className="text-[#95d4b3]">{sleepHrs} hours of restorative rest</strong> puts you in prime biological alignment. 
                  Your cognitive baseline is flow-ready. 
                  <br /><br />
                  Let's seize this high energy state by tackling your primary focus: <strong>"{goal}"</strong>. 
                  Let's plan a clean 45-minute focus session of morning writing while prefrontal dopamine is at peak level."
                </p>
              )}

              <div className="pt-2 border-t border-[#44474a]/20 flex justify-between items-center text-[10px] text-[#8f9194] font-mono">
                <span>Calculated Rest Score: {getCalculatedScore()}/100</span>
                <span className="text-[#95d4b3] font-bold">SHAME MODERATION PROTOCOL ACTIVE</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                id="onboarding-stage3-back"
                type="button"
                onClick={prevStage}
                className="w-1/4 py-3 border border-[#44474a] hover:bg-[#323536]/30 text-[#c5c6ca] font-bold text-xs rounded-xl cursor-pointer bg-transparent"
              >
                Back
              </button>
              <button
                id="onboarding-launch-system"
                type="button"
                onClick={handleLaunch}
                className="w-3/4 py-3 bg-gradient-to-r from-[#95d4b3] to-[#e9c176] text-[#2f3133] font-bold text-sm tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#95d4b3]/10 border-none"
              >
                Launch ambient wellness system
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
