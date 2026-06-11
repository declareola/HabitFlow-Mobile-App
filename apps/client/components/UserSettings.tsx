import React, { useState } from "react";
import { useHabitStore } from "../store/useHabitStore";
import { motion, AnimatePresence } from "motion/react";

export const UserSettings: React.FC = () => {
  const {
    strictBlockMode,
    autoFocusDetection,
    soundscapeVolume,
    coachSensitivity,
    recoveryAlerts,
    habitReminders,
    weeklyBriefings,
    appTheme,
    syncToSystemTheme,
    setView,
    updateSettings,
    awardXP
  } = useHabitStore();

  // Temporary local states so user can save or discard
  const [tempStrict, setTempStrict] = useState(strictBlockMode);
  const [tempAuto, setTempAuto] = useState(autoFocusDetection);
  const [tempVolume, setTempVolume] = useState(soundscapeVolume);
  const [tempSensitivity, setTempSensitivity] = useState(coachSensitivity);
  const [tempRecovery, setTempRecovery] = useState(recoveryAlerts);
  const [tempHabitRemind, setTempHabitRemind] = useState(habitReminders);
  const [tempWeekly, setTempWeekly] = useState(weeklyBriefings);
  const [tempTheme, setTempTheme] = useState(appTheme);
  const [tempSyncSystem, setTempSyncSystem] = useState(syncToSystemTheme || false);
  
  const [notification, setNotification] = useState<string | null>(null);

  // Sync state variables once the store loads or hydrates
  React.useEffect(() => {
    setTempStrict(strictBlockMode);
    setTempAuto(autoFocusDetection);
    setTempVolume(soundscapeVolume);
    setTempSensitivity(coachSensitivity);
    setTempRecovery(recoveryAlerts);
    setTempHabitRemind(habitReminders);
    setTempWeekly(weeklyBriefings);
    setTempTheme(appTheme);
    setTempSyncSystem(syncToSystemTheme || false);
  }, [
    strictBlockMode,
    autoFocusDetection,
    soundscapeVolume,
    coachSensitivity,
    recoveryAlerts,
    habitReminders,
    weeklyBriefings,
    appTheme,
    syncToSystemTheme
  ]);

  const handleSave = () => {
    updateSettings({
      strictBlockMode: tempStrict,
      autoFocusDetection: tempAuto,
      soundscapeVolume: tempVolume,
      coachSensitivity: tempSensitivity,
      recoveryAlerts: tempRecovery,
      habitReminders: tempHabitRemind,
      weeklyBriefings: tempWeekly,
      appTheme: tempTheme,
      syncToSystemTheme: tempSyncSystem
    });
    awardXP(150); // reward minor configuration efforts
    showNotification("Configuration saved & backup synchronized successfully!");
  };

  const handleDiscard = () => {
    setTempStrict(strictBlockMode);
    setTempAuto(autoFocusDetection);
    setTempVolume(soundscapeVolume);
    setTempSensitivity(coachSensitivity);
    setTempRecovery(recoveryAlerts);
    setTempHabitRemind(habitReminders);
    setTempWeekly(weeklyBriefings);
    setTempTheme(appTheme);
    setTempSyncSystem(syncToSystemTheme || false);
    
    // Also instantly revert the live theme if it was updated in real-time
    updateSettings({
      appTheme,
      syncToSystemTheme
    });

    showNotification("Changes discarded reset to persistent thresholds.");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const getSensitivityLabel = (val: number) => {
    if (val < 35) return "Reactive Only";
    if (val < 75) return "Balanced";
    return "Hyper-Proactive";
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            id="settings-notification"
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#12533a] border border-[#95d4b3] text-[#95d4b3] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-md animate-bounce">check_circle</span>
            <span className="font-semibold text-xs">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1d2021] to-[#12533a]/25 p-6 rounded-2xl border border-[#8f9194]/10">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">PLATFORM OPERATING SYSTEM</span>
          <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Focus Engine Config</h1>
          <p className="text-[#c5c6ca] text-sm mt-1">
            Reconfigure background filters, sleep triggers, and AI response parameters.
          </p>
        </div>
        <button
          id="settings-view-profile"
          type="button"
          onClick={() => setView("profile")}
          className="px-4 py-2.5 rounded-xl bg-[#95d4b3] text-[#002114] hover:bg-[#b1f0ce] text-xs font-bold tracking-wider flex items-center gap-2 self-start md:self-auto transition-all transition-colors cursor-pointer border-none shadow-md shadow-[#95d4b3]/10"
        >
          <span className="material-symbols-outlined text-sm font-semibold">person</span>
          VIEW MY BASELINE
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Context Nav */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block">CONFIGURATION SHELL</span>
            
            <nav className="space-y-1">
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 bg-[#323536] text-[#95d4b3] border-none"
              >
                <span className="material-symbols-outlined text-md">bolt</span>
                <span>Focus Engine</span>
              </button>
              <button
                type="button"
                onClick={() => setView("cognitive")}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-[#c5c6ca] hover:bg-[#323536]/20 transition-all cursor-pointer bg-transparent border-none"
              >
                <span className="material-symbols-outlined text-md text-[#8f9194]">shield</span>
                <span>Neuro Privacy</span>
              </button>
              <button
                type="button"
                onClick={() => setView("profile")}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-[#c5c6ca] hover:bg-[#323536]/20 transition-all cursor-pointer bg-transparent border-none"
              >
                <span className="material-symbols-outlined text-md text-[#8f9194]">manage_accounts</span>
                <span>Account Identity</span>
              </button>
            </nav>

            <div className="p-3.5 rounded-xl bg-[#111415]/80 border border-[#323536] mt-4">
              <span className="block text-[8px] font-mono text-[#8f9194] uppercase mb-1">LAST SECURE KEY SYNC</span>
              <p className="text-[#e1e3e4] text-xs font-bold font-mono">OK • {new Date().toLocaleDateString()}</p>
              <span className="text-[9px] text-[#95d4b3] hover:underline cursor-pointer block mt-1.5" onClick={() => showNotification("Biometric nodes verified. Key synchrony stable.")}>Re-index nodes</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-8 space-y-6">

          {/* Theme Customizer Card */}
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-5">
            <h3 className="text-[#e1e3e4] font-semibold text-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[#95d4b3]">palette</span>
              Visual Interface Theme Customizer
            </h3>
            
            <p className="text-[11px] text-[#8f9194] leading-relaxed">
              Select an optimized atmospheric illumination layout calibrated for prefrontal cognitive stimulation or deep evening rest cycles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { 
                  id: "ambient-green", 
                  label: "Ambient Green", 
                  desc: "Default clinical bio-restoration layout",
                  accentBg: "bg-[#12533a]", 
                  accentText: "text-[#95d4b3]" 
                },
                { 
                  id: "deep-indigo", 
                  label: "Deep Indigo", 
                  desc: "NSDR theta brain wave entrainment style",
                  accentBg: "bg-[#1e1b4b]", 
                  accentText: "text-[#818cf8]" 
                },
                { 
                  id: "cyber-orange", 
                  label: "Cyber Orange", 
                  desc: "High cortisol morning analytical stimulation",
                  accentBg: "bg-[#431407]", 
                  accentText: "text-[#f97316]" 
                }
              ].map((themeOpt) => (
                <button
                  key={themeOpt.id}
                  id={`theme-select-btn-${themeOpt.id}`}
                  type="button"
                  onClick={() => {
                    const nextTheme = themeOpt.id as any;
                    setTempTheme(nextTheme);
                    setTempSyncSystem(false); // disable sync on manual override
                    updateSettings({
                      appTheme: nextTheme,
                      syncToSystemTheme: false
                    });
                    awardXP(50); // Small XP reward for personalization
                  }}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between h-28 ${
                    tempTheme === themeOpt.id 
                      ? "bg-[#323536]/80 text-white border-[#95d4b3]" 
                      : "bg-[#111415]/60 hover:bg-[#111415] text-[#c5c6ca] border-[#44474a]/40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold font-sans">{themeOpt.label}</span>
                    <span className={`w-3.5 h-3.5 rounded-full ${themeOpt.accentBg} border border-white/15 flex items-center justify-center shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-white transition-opacity ${tempTheme === themeOpt.id ? "opacity-100" : "opacity-0"}`} />
                    </span>
                  </div>
                  
                  <span className="block text-[9px] text-[#8f9194] leading-tight font-sans select-none mt-2">
                    {themeOpt.desc}
                  </span>

                  <div className="mt-3.5 flex gap-1 items-center">
                    <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${themeOpt.accentBg} ${themeOpt.accentText} bg-opacity-30 font-extrabold tracking-wider`}>
                      ACTIVE SPECTRUM
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Sync to System Preference Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-[#323536]/50">
              <div className="max-w-[75%]">
                <span className="text-xs font-bold text-[#e1e3e4] block">Sync to System Preference</span>
                <span className="text-[11px] text-[#8f9194] leading-relaxed">
                  Automatically set local theme colorways using OS prefers-color-scheme media query triggers (Ambient Green on dark, Cyber Orange on light).
                </span>
              </div>
              <button
                id="settings-sync-theme-toggle"
                type="button"
                onClick={() => {
                  const newSync = !tempSyncSystem;
                  setTempSyncSystem(newSync);
                  let finalTheme = tempTheme;
                  if (newSync) {
                    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    finalTheme = isDark ? "ambient-green" : "cyber-orange";
                    setTempTheme(finalTheme);
                    awardXP(100);
                  }
                  updateSettings({
                    appTheme: finalTheme,
                    syncToSystemTheme: newSync
                  });
                }}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none flex items-center ${
                  tempSyncSystem ? "bg-[#12533a]" : "bg-[#323536]"
                }`}
              >
                <span className={`w-4.5 h-4.5 bg-white rounded-full transition-transform mx-0.5 ${tempSyncSystem ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>
          
          {/* Focus Engine card */}
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-6">
            <h3 className="text-[#e1e3e4] font-semibold text-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[#95d4b3]">psychology</span>
              Focus Engine Configuration
            </h3>

            <div className="space-y-5">
              
              {/* Toggle 1: Strict Block Mode */}
              <div className="flex items-center justify-between pb-3 border-b border-[#323536]/45">
                <div className="max-w-[75%]">
                  <span className="text-xs font-bold text-[#e1e3e4] block">Strict Block Mode</span>
                  <span className="text-[11px] text-[#8f9194] leading-relaxed">
                    Hides all non-essential telemetry pings and locks secondary tabs during designated deep work sessions.
                  </span>
                </div>
                <button
                  id="settings-strict-toggle"
                  type="button"
                  onClick={() => setTempStrict(!tempStrict)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none flex items-center ${
                    tempStrict ? "bg-[#12533a]" : "bg-[#323536]"
                  }`}
                >
                  <span className={`w-4.5 h-4.5 bg-white rounded-full transition-transform mx-0.5 ${tempStrict ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Toggle 2: Auto focus detection */}
              <div className="flex items-center justify-between pb-3 border-b border-[#323536]/45">
                <div className="max-w-[75%]">
                  <span className="text-xs font-bold text-[#e1e3e4] block">Automatic Focus Detection</span>
                  <span className="text-[11px] text-[#8f9194] leading-relaxed">
                    Automatically triggers deep work intervals upon detecting high-cadence key entry or positive biometric rest scores.
                  </span>
                </div>
                <button
                  id="settings-auto-focus-toggle"
                  type="button"
                  onClick={() => setTempAuto(!tempAuto)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none flex items-center ${
                    tempAuto ? "bg-[#12533a]" : "bg-[#323536]"
                  }`}
                >
                  <span className={`w-4.5 h-4.5 bg-white rounded-full transition-transform mx-0.5 ${tempAuto ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Slider 1: Soundscape volume */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-[#e1e3e4] block">Soundscape Volume</span>
                    <span className="text-[11px] text-[#8f9194] leading-relaxed">
                      Intensity multiplier for generative audio stream modules layered in deep sessions.
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#95d4b3] bg-[#12533a]/30 px-2 py-0.5 rounded-md font-bold">{tempVolume}%</span>
                </div>
                <input
                  id="settings-sound-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={tempVolume}
                  onChange={(e) => setTempVolume(Number(e.target.value))}
                  className="w-full accent-[#95d4b3] h-1.5 bg-[#323536] rounded-lg appearance-none cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* AI Coach Sensitivity card */}
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-5">
            <h3 className="text-[#e1e3e4] font-semibold text-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e9c176]">auto_awesome</span>
              AI Coach Proactivity Sensitivity
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-[#e1e3e4] block">Proactive Wellness Interventions</span>
                <span className="text-[11px] text-[#8f9194] leading-relaxed">
                  Controls how frequently the Biorhythm coach prompts you to drink water, perform NSDR, or pause work.
                </span>
              </div>

              <div className="pt-2">
                <input
                  id="settings-coach-sensitivity-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={tempSensitivity}
                  onChange={(e) => setTempSensitivity(Number(e.target.value))}
                  className="w-full accent-[#e9c176] h-1.5 bg-[#323536] rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-[#8f9194] pt-2">
                  <span>Reactive Only</span>
                  <span className={getSensitivityLabel(tempSensitivity) === "Balanced" ? "text-[#e9c176] font-bold" : ""}>Balanced</span>
                  <span className={getSensitivityLabel(tempSensitivity) === "Hyper-Proactive" ? "text-purple-400 font-bold" : ""}>Hyper-Proactive</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Protocol card */}
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-5">
            <h3 className="text-[#e1e3e4] font-semibold text-md flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">notifications</span>
              Circadian Notification Protocol
            </h3>

            <div className="space-y-4">
              
              {/* Alert 1 */}
              <div className="flex items-center justify-between pb-2">
                <div>
                  <span className="text-xs font-semibold text-[#e1e3e4] block">Recovery Score Alerts</span>
                  <span className="text-[11px] text-[#8f9194]">Push warning when rest level indexes drop key threshold limit (&lt; 40%).</span>
                </div>
                <button
                  id="settings-recovery-alert-toggle"
                  type="button"
                  onClick={() => setTempRecovery(!tempRecovery)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none flex items-center ${
                    tempRecovery ? "bg-[#12533a]" : "bg-[#323536]"
                  }`}
                >
                  <span className={`w-4.5 h-4.5 bg-white rounded-full transition-transform mx-0.5 ${tempRecovery ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Alert 2 */}
              <div className="flex items-center justify-between pb-2">
                <div>
                  <span className="text-xs font-semibold text-[#e1e3e4] block">Habit reminders</span>
                  <span className="text-[11px] text-[#8f9194]">Contextual pings layered based on custom Morning &amp; Evening Stack intervals.</span>
                </div>
                <button
                  id="settings-habit-alert-toggle"
                  type="button"
                  onClick={() => setTempHabitRemind(!tempHabitRemind)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none flex items-center ${
                    tempHabitRemind ? "bg-[#12533a]" : "bg-[#323536]"
                  }`}
                >
                  <span className={`w-4.5 h-4.5 bg-white rounded-full transition-transform mx-0.5 ${tempHabitRemind ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Alert 3 */}
              <div className="flex items-center justify-between pb-2">
                <div>
                  <span className="text-xs font-semibold text-[#e1e3e4] block">Weekly Brain Briefings</span>
                  <span className="text-[11px] text-[#8f9194]">Deep Monday morning analysis summarizing prefrontal recovery and water log accuracy.</span>
                </div>
                <button
                  id="settings-weekly-briefing-toggle"
                  type="button"
                  onClick={() => setTempWeekly(!tempWeekly)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none flex items-center ${
                    tempWeekly ? "bg-[#12533a]" : "bg-[#323536]"
                  }`}
                >
                  <span className={`w-4.5 h-4.5 bg-white rounded-full transition-transform mx-0.5 ${tempWeekly ? "translate-x-5" : ""}`} />
                </button>
              </div>

            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              id="settings-discard-changes-btn"
              type="button"
              onClick={handleDiscard}
              className="px-5 py-3 rounded-xl bg-transparent border border-[#44474a] text-[#8f9194] hover:text-white hover:bg-white/5 text-xs font-bold cursor-pointer transition-colors"
            >
              Discard Changes
            </button>
            <button
              id="settings-save-changes-btn"
              type="button"
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-[#95d4b3] text-[#002114] hover:bg-[#b1f0ce] text-xs font-bold cursor-pointer border-none shadow-md shadow-[#95d4b3]/10 transition-colors"
            >
              Save Configuration
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
