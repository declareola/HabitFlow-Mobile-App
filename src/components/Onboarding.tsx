import React, { useState } from "react";
import { motion } from "motion/react";

interface OnboardingProps {
  onComplete: (sleepFeedback: number, weeklyFocus: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [sleepScore, setSleepScore] = useState<number>(3); // 1-5 scale
  const [priority, setPriority] = useState<string>("Productive deep work session");
  const [showNext, setShowNext] = useState<boolean>(false);

  const getSleepText = (score: number) => {
    switch (score) {
      case 1: return "Exhausted - Rest is critical today";
      case 2: return "Restless sleep - Low energy baseline";
      case 3: return "Fair - Balanced but needs focus alignment";
      case 4: return "Well rested - High cognitive potential";
      case 5: return "Exemplary sleep - Flow-ready state";
      default: return "";
    }
  };

  const getSleepIcon = (score: number) => {
    switch (score) {
      case 1: return "sentiment_dissatisfied";
      case 2: return "sentiment_neutral";
      case 3: return "sentiment_satisfied";
      case 4: return "sentiment_satisfied";
      case 5: return "sentiment_satisfied";
      default: return "bedtime";
    }
  };

  const submitOnboarding = () => {
    // Translate 1-5 scale into a calculated sleep score (e.g., 50, 65, 80, 92, 100)
    const scoreMap = [50, 65, 82, 92, 100];
    const score = scoreMap[sleepScore - 1] || 82;
    onComplete(score, priority);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        id="onboarding-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg p-8 rounded-2xl glass-panel border border-[#8f9194]/20 shadow-2xl relative overflow-hidden"
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#95d4b3]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#e9c176]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-6 text-[#95d4b3]">
          <span className="material-symbols-outlined text-3xl">light_mode</span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#87c6a5]">Circadian Init</span>
        </div>

        {!showNext ? (
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[#e1e3e4] mb-3">
              Hello, Alex.
            </h1>
            <p className="text-[#c5c6ca] text-lg mb-8">
              How did you sleep last night?
            </p>

            {/* Interactive Sleep Selector */}
            <div className="grid grid-cols-5 gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  id={`onboarding-sleep-btn-${num}`}
                  type="button"
                  onClick={() => setSleepScore(num)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border ${
                    sleepScore === num
                      ? "border-[#95d4b3] bg-[#12533a]/30 text-[#95d4b3] shadow-md shadow-[#95d4b3]/10 scale-105"
                      : "border-[#44474a]/40 bg-[#1d2021]/60 text-[#c5c6ca] hover:border-[#8f9194]/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl mb-2">
                    {num === 1 ? "sentiment_dissatisfied" : num === 2 ? "sentiment_neutral" : "sentiment_satisfied"}
                  </span>
                  <span className="font-mono text-sm font-semibold">{num}</span>
                </button>
              ))}
            </div>

            <div className="bg-[#191c1d]/80 rounded-xl p-4 border border-[#44474a]/30 text-center mb-8">
              <span className="text-[#95d4b3] text-sm font-medium">
                {getSleepText(sleepScore)}
              </span>
            </div>

            <button
              id="onboarding-next-btn"
              type="button"
              onClick={() => setShowNext(true)}
              className="w-full py-3 px-6 rounded-xl bg-[#c6c6c9] hover:bg-[#e1e3e4] text-[#2f3133] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              Configure Priority Task
              <span className="material-symbols-outlined text-md">arrow_forward</span>
            </button>
          </div>
        ) : (
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[#e1e3e4] mb-3">
              Setting Focus
            </h1>
            <p className="text-[#c5c6ca] text-md mb-6">
              What is your primary cognitive focus for today?
            </p>

            <div className="space-y-3 mb-8">
              {[
                "Strategic product architecture refactor",
                "Deep analytical reading and note-taking",
                "Figma system layout design",
                "Physical stamina active recovery"
              ].map((item) => (
                <button
                  key={item}
                  id={`onboarding-focus-opt-${item.replace(/\s+/g, '-').toLowerCase()}`}
                  type="button"
                  onClick={() => setPriority(item)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    priority === item
                      ? "border-[#e9c176] bg-[#261900]/40 text-[#e9c176]"
                      : "border-[#44474a]/40 bg-[#1d2021]/60 text-[#c5c6ca] hover:border-[#8f9194]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">
                      {priority === item ? "radio_button_checked" : "radio_button_unchecked"}
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="mb-8">
              <label htmlFor="custom-focus-input" className="block font-mono text-xs uppercase tracking-wider text-[#8f9194] mb-2">Or write a custom focal task:</label>
              <input
                id="onboarding-custom-focus"
                name="custom-focus-input"
                type="text"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="Enter custom absolute focal priority..."
                className="w-full bg-[#111415] border border-[#44474a]/60 rounded-xl p-3 text-sm text-[#e1e3e4] focus:outline-none focus:border-[#95d4b3] transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                id="onboarding-back-btn"
                type="button"
                onClick={() => setShowNext(false)}
                className="w-1/3 py-3 rounded-xl border border-[#44474a] text-[#c5c6ca] font-medium hover:bg-[#323536]/30 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                id="onboarding-submit-btn"
                type="button"
                onClick={submitOnboarding}
                className="w-2/3 py-3 bg-[#95d4b3] text-[#003824] font-semibold rounded-xl hover:bg-[#b1f0ce] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#95d4b3]/15"
              >
                Launch System
                <span className="material-symbols-outlined text-md">check</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
