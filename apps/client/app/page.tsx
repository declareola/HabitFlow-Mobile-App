import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHabitStore } from "../store/useHabitStore";
import { haptics } from "../hooks/useHaptics";

// View components
import { Onboarding } from "../components/Onboarding";
import { Dashboard } from "../components/Dashboard";
import { HabitEngine } from "../components/HabitEngine";
import { CognitiveAnalytics } from "../components/CognitiveAnalytics";
import { TrophyRoom } from "../components/TrophyRoom";
import { WellnessLogger } from "../components/WellnessLogger";
import { FocusTimer } from "../components/FocusTimer";
import { UserProfile } from "../components/UserProfile";
import { UserSettings } from "../components/UserSettings";
import { NeuroCircadianLab } from "../components/NeuroCircadianLab";

export default function Home() {
  const {
    currentView,
    setView,
    weeklyFocus,
    userLevel,
    userName,
    appTheme,
    syncToSystemTheme,
    updateSettings,
    soundscapeVolume
  } = useHabitStore();

  React.useEffect(() => {
    if (!syncToSystemTheme) return;

    const getSystemThemeMapping = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return isDark ? "ambient-green" : "cyber-orange";
    };

    // Apply initially
    const targetTheme = getSystemThemeMapping();
    if (appTheme !== targetTheme) {
      updateSettings({ appTheme: targetTheme });
    }

    // Set up listener for system runtime theme variations
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const updatedTheme = getSystemThemeMapping();
      updateSettings({ appTheme: updatedTheme });
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [syncToSystemTheme, appTheme, updateSettings]);

  const [isEmulatorActive, setIsEmulatorActive] = React.useState(true);
  const [isPhoneAsleep, setIsPhoneAsleep] = React.useState(false);
  const [simulatedTime, setSimulatedTime] = React.useState("09:41");
  const [simulatedBattery, setSimulatedBattery] = React.useState(94);
  const [isCharging, setIsCharging] = React.useState(true);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSimulatedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 20000);
    return () => clearInterval(interval);
  }, []);

  // Update battery slowly
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedBattery(b => {
        if (b >= 100) {
          setIsCharging(false);
          return 99;
        }
        return b + 1;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);


  const handleMockVolumeUp = () => {
    updateSettings({ soundscapeVolume: Math.min(100, soundscapeVolume + 10) });
  };

  const handleMockVolumeDown = () => {
    updateSettings({ soundscapeVolume: Math.max(0, soundscapeVolume - 10) });
  };

  const currentTab = (() => {
    if (currentView === "dashboard") return "dashboard";
    if (currentView === "timer") return "timer";
    if (currentView === "habits") return "habits";
    if (["lab", "cognitive", "trophy", "logger"].includes(currentView)) return "lab";
    if (["profile", "settings"].includes(currentView)) return "profile";
    return "dashboard";
  })();

  const handleTabClick = (tabId: string) => {
    haptics.light();
    if (tabId === "dashboard") setView("dashboard");
    else if (tabId === "timer") setView("timer");
    else if (tabId === "habits") setView("habits");
    else if (tabId === "lab") setView("lab");
    else if (tabId === "profile") setView("profile");
  };

  return (
    <div className={`min-h-screen bg-[#0c0e0f] text-[#e1e3e4] flex flex-col items-center justify-start font-sans selection:bg-[#95d4b3]/30 theme-${appTheme}`}>
      
      {/* Absolute Header Controls - Mode Selector & Status (Hidden on true mobile screens) */}
      <div className="hidden sm:flex w-full max-w-6xl px-4 py-3 sm:px-6 items-center justify-between z-50 border-b border-[#1d2021]/80 bg-[#0c0e0f]/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#95d4b3] to-[#e9c176] flex items-center justify-center text-[#2f3133] shadow-md">
            <span className="material-symbols-outlined text-sm font-bold">local_fire_department</span>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-sm tracking-tight text-[#e1e3e4] leading-tight">HabitFlow 2.0</h1>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#95d4b3] block leading-none">Playstore Candidate View</span>
          </div>
        </div>

        {/* Emulator Toggle Control */}
        <div className="flex items-center gap-2">
          <button
            id="emulator-toggle-responsive-btn"
            type="button"
            onClick={() => setIsEmulatorActive(false)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              !isEmulatorActive
                ? "bg-[#12533a] text-[#95d4b3] border border-[#95d4b3]/30"
                : "bg-[#191c1d] text-[#8f9194] border border-[#323536] hover:text-[#e1e3e4]"
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">fullscreen</span>
            <span>REPONSIVE EXPAND</span>
          </button>
          
          <button
            id="emulator-toggle-mobile-btn"
            type="button"
            onClick={() => setIsEmulatorActive(true)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isEmulatorActive
                ? "bg-[#12533a] text-[#95d4b3] border border-[#95d4b3]/30"
                : "bg-[#191c1d] text-[#8f9194] border border-[#323536] hover:text-[#e1e3e4]"
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">smartphone</span>
            <span>MOBILE EMULATOR</span>
          </button>
        </div>
      </div>

      {/* Main Core Layout Layout-Block */}
      <div className="w-full flex-1 flex flex-col items-center justify-start sm:py-8 sm:px-4 relative">
        
        {/* Device Wrapper and interactive mock structure */}
        <div className={`relative transition-all duration-500 ease-out ${
          isEmulatorActive 
            ? "w-full sm:max-w-[415px] sm:rounded-[52px] sm:bg-[#1d2021] sm:border-[14px] sm:border-[#2d3032] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] sm:ring-1 sm:ring-[#e1e3e4]/10 select-none overflow-hidden" 
            : "w-full max-w-5xl"
        }`}>
          
          {/* Hardware Parts (Only visible in Emulator Mode on Desktop viewports) */}
          {isEmulatorActive && (
            <div className="hidden sm:block">
              {/* Dynamic physical volume/power interactive nodes */}
              <div 
                className="absolute left-[-16px] top-[140px] w-[5px] h-[45px] bg-[#3a3d3f] border-r border-[#111] rounded-l-[4px] hover:bg-[#95d4b3] transition-colors cursor-pointer z-50 flex items-center justify-center text-[8px]"
                onClick={handleMockVolumeUp}
                title="Mock Volume Up"
              ></div>
              <div 
                className="absolute left-[-16px] top-[195px] w-[5px] h-[45px] bg-[#3a3d3f] border-r border-[#111] rounded-l-[4px] hover:bg-[#95d4b3] transition-colors cursor-pointer z-50"
                onClick={handleMockVolumeDown}
                title="Mock Volume Down"
              ></div>
              <div 
                className="absolute right-[-16px] top-[160px] w-[5px] h-[65px] bg-[#3a3d3f] border-l border-[#111] rounded-r-[4px] hover:bg-[#e9c176] transition-colors cursor-pointer z-50"
                onClick={() => setIsPhoneAsleep(!isPhoneAsleep)}
                title="Mock Sleep/Power Toggle"
              ></div>

              {/* Dynamic Island Notch */}
              <div className="absolute top-[6px] left-[50%] translate-x-[-50%] z-50 w-[110px] h-[25px] bg-[#0c0e0f] rounded-full border border-white/5 flex items-center justify-between px-3.5 shadow-inner transition-all hover:w-[220px] group overflow-hidden">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1e2325] border border-blue-500/30 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                </span>
                
                {/* Embedded Glowing Status dot inside dynamic island */}
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-mono text-[#95d4b3] hidden group-hover:inline-block tracking-widest animate-pulse font-bold uppercase">HABITFLOW CONNECT</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#95d4b3] animate-pulse"></span>
                </div>
              </div>

              {/* Status Bar */}
              <div className="w-full h-11 bg-[#111415] px-6 pt-1.5 flex items-center justify-between text-[11px] font-mono text-[#e1e3e4] font-semibold tracking-tight select-none">
                <div className="flex items-center gap-1">
                  <span>{simulatedTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-[#95d4b3]">signal_cellular_4_bar</span>
                  <span className="text-[9px] font-semibold text-[#8f9194]">LTE</span>
                  <span className="material-symbols-outlined text-[13px] text-[#95d4b3]">wifi</span>
                  <div className="flex items-center gap-0.5 border border-[#8f9194]/40 rounded px-1.5 py-[1px] text-[10px] bg-black/40">
                    <span>{simulatedBattery}%</span>
                    {isCharging && <span className="text-[9px] text-[#e9c176] animate-pulse">⚡</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Screen Saver / Sleep Overlay */}
          {isEmulatorActive && isPhoneAsleep && (
            <div 
              className="hidden sm:flex absolute inset-0 bg-[#0c0f10] z-[60] flex-col items-center justify-center p-8 text-center cursor-pointer select-none"
              onClick={() => setIsPhoneAsleep(false)}
            >
              <div className="absolute top-12 text-[10px] font-mono tracking-widest text-[#95d4b3] font-bold uppercase animate-pulse">
                AMBIENT DORMANT SLEEP STATE
              </div>
              <h2 className="text-5xl font-display font-extrabold text-[#e1e3e4] tracking-tight">{simulatedTime}</h2>
              <span className="font-mono text-xs text-[#8f9194] mt-2 block">Level {userLevel} Optimizer</span>
              
              <div className="mt-12 p-6 rounded-2xl bg-gradient-to-b from-[#191c1d] to-[#12533a]/15 border border-[#12533a]/25 max-w-[280px]">
                <div className="text-[9px] font-mono text-[#95d4b3] uppercase tracking-widest mb-1.5">CIRCADIAN READY STATE</div>
                <span className="text-sm font-semibold text-white block">Sleep Target stable at 85% score.</span>
                <p className="text-[11px] text-[#8f9194] leading-tight mt-1">Noise generators actively processing carrier waves.</p>
              </div>

              {/* Home indicator gesture line */}
              <div className="absolute bottom-4 left-1/2 translate-x-[-50%] text-center text-[10px] text-[#8f9194] font-semibold flex items-center gap-1.5 animate-bounce">
                <span className="material-symbols-outlined text-[12px]">keyboard_double_arrow_up</span>
                <span>TAP ANYWHERE OR POWER TO WAKE</span>
              </div>
            </div>
          )}

          {/* Core App Viewport Area */}
          <div className={`bg-[#111415] text-[#e1e3e4] flex flex-col relative ${
            isEmulatorActive 
              ? "w-full h-full min-h-screen sm:min-h-[500px] sm:h-[740px] sm:overflow-y-auto scrollbar-none" 
              : "w-full sm:rounded-3xl sm:border border-[#323536] overflow-hidden"
          }`}>
            
            {/* Embedded Mini App Header - Matches exactly Mobile layout */}
            <header className="sticky top-0 z-40 bg-[#111415]/90 border-b border-[#323536]/80 px-4 py-2.5 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#95d4b3] flex items-center justify-center text-[#2f3133]">
                  <span className="material-symbols-outlined text-[14px] font-bold">local_fire_department</span>
                </div>
                <div>
                  <h1 className="font-display font-extrabold text-xs tracking-tight text-[#e1e3e4]">HabitFlow AI</h1>
                  <span className="text-[8px] font-mono text-[#95d4b3] leading-none block">Ambient System</span>
                </div>
              </div>

              {/* Navigation Shortcuts - Consolidated buttons */}
              {currentView !== "welcome" && (
                <div className="flex items-center gap-1.5">
                  <button
                    id="header-mobile-shortcut-logger-btn"
                    type="button"
                    onClick={() => setView("logger")}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      currentView === "logger"
                        ? "bg-[#12533a]/50 text-[#95d4b3] border-[#95d4b3]"
                        : "bg-[#1d2021]/80 hover:bg-[#323536]/40 text-[#c5c6ca] border-[#44474a]/20"
                    }`}
                    title="Biomarker Entry"
                  >
                    <span className="material-symbols-outlined text-[15px]">water_drop</span>
                  </button>

                  <button
                    id="header-mobile-shortcut-settings-btn"
                    type="button"
                    onClick={() => setView("settings")}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      currentView === "settings"
                        ? "bg-[#12533a]/50 text-[#95d4b3] border-[#95d4b3]"
                        : "bg-[#1d2021]/80 hover:bg-[#323536]/40 text-[#c5c6ca] border-[#44474a]/20"
                    }`}
                    title="Config Engine"
                  >
                    <span className="material-symbols-outlined text-[15px]">settings</span>
                  </button>
                  
                  {/* XP / Level Quick Badge info */}
                  <button
                    id="header-mobile-shortcut-profile-btn"
                    type="button"
                    onClick={() => setView("profile")}
                    className="flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-lg bg-[#1d2021]/80 border border-[#44474a]/30 text-[10px] font-mono font-bold text-[#e1e3e4]"
                  >
                    <span>⚡</span>
                    <span className="text-[#95d4b3]">L{userLevel}</span>
                  </button>
                </div>
              )}
            </header>

            {/* Layout Viewport: Sidebar is completely deprecated under Emulator mode, maintaining 5 consolidated mobile tabs */}
            <div className="flex-1 flex flex-col">
              
              <main className="flex-1 p-3.5 sm:p-5 w-full flex flex-col justify-start">
                
                {/* 1. TOP SEGMENT SELECTORS (For views grouped under standard main tabs) */}
                {currentView !== "welcome" && (
                  <>
                    {/* Segment selector if currentView is under Tab 4 (Biomarker Lab) */}
                    {["lab", "cognitive", "trophy", "logger"].includes(currentView) && (
                      <div className="flex items-center gap-1 p-1 bg-[#1d2021]/80 rounded-xl border border-[#44474a]/40 overflow-x-auto scrollbar-none mb-3">
                        {[
                          { id: "lab", label: "Circadian Lab", icon: "science" },
                          { id: "cognitive", label: "Neuro Analytics", icon: "psychology" },
                          { id: "trophy", label: "Trophy Room", icon: "trophy" },
                          { id: "logger", label: "Health Log", icon: "water_drop" }
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            id={`sub-tab-lab-${sub.id}`}
                            onClick={() => {
                              haptics.light();
                              setView(sub.id);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all border-none cursor-pointer ${
                              currentView === sub.id 
                                ? "bg-[#323536] text-[#95d4b3]" 
                                : "text-[#c5c6ca] hover:bg-[#323536]/30 bg-transparent"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[12px]">{sub.icon}</span>
                            <span>{sub.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Segment selector if currentView is under Tab 5 (Baseline) */}
                    {["profile", "settings"].includes(currentView) && (
                      <div className="flex items-center gap-1 p-1 bg-[#1d2021]/80 rounded-xl border border-[#44474a]/40 mb-3">
                        {[
                          { id: "profile", label: "Identity Baseline", icon: "person" },
                          { id: "settings", label: "Engine Config", icon: "settings" }
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            id={`sub-tab-profile-${sub.id}`}
                            onClick={() => {
                              haptics.light();
                              setView(sub.id);
                            }}
                            className={`flex-1 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
                              currentView === sub.id 
                                ? "bg-[#323536] text-[#95d4b3]" 
                                : "text-[#c5c6ca] hover:bg-[#323536]/30 bg-transparent"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[12px]">{sub.icon}</span>
                            <span>{sub.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* 2. Page Contents Rendered with crisp exit/fades */}
                <div className="flex-1 flex flex-col">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentView}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      className="flex-1 flex flex-col justify-start"
                    >
                      {currentView === "welcome" && <Onboarding />}
                      {currentView === "dashboard" && <Dashboard />}
                      {currentView === "habits" && <HabitEngine />}
                      {currentView === "cognitive" && <CognitiveAnalytics />}
                      {currentView === "trophy" && <TrophyRoom />}
                      {currentView === "logger" && <WellnessLogger />}
                      {currentView === "timer" && <FocusTimer />}
                      {currentView === "profile" && <UserProfile />}
                      {currentView === "settings" && <UserSettings />}
                      {currentView === "lab" && <NeuroCircadianLab />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </main>
            </div>

            {/* 3. Highly Polished Bottom Nav Bar (Consolidated into 5 standard mobile tabs) */}
            {currentView !== "welcome" && (
              <nav className="sticky bottom-0 z-40 bg-[#161819]/95 border-t border-[#323536]/80 py-2.5 px-3 flex items-center justify-between text-center backdrop-blur-md">
                {[
                  { id: "dashboard", label: "Rituals", icon: "home" },
                  { id: "timer", label: "Deep Work", icon: "schedule" },
                  { id: "habits", label: "Stacks", icon: "cognition" },
                  { id: "lab", label: "Bio Lab", icon: "science" },
                  { id: "profile", label: "Profile", icon: "person" }
                ].map((screen) => {
                  const isActive = currentTab === screen.id;
                  return (
                    <button
                      key={screen.id}
                      id={`mobile-nav-btn-v2-${screen.id}`}
                      type="button"
                      onClick={() => handleTabClick(screen.id)}
                      className={`flex-1 flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer transition-all ${
                        isActive 
                          ? "text-[#95d4b3] scale-105 font-bold" 
                          : "text-[#8f9194] hover:text-[#e1e3e4]"
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl transition-all ${
                        isActive ? "bg-[#12533a]/30" : "bg-transparent"
                      }`}>
                        <span className="material-symbols-outlined text-[20px] block leading-none">{screen.icon}</span>
                      </div>
                      <span className="text-[9px] font-semibold leading-none">{screen.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Subtle Virtual Home Bar Swipe Gestures indicator */}
            {isEmulatorActive && (
              <div className="hidden sm:flex w-full h-4 bg-[#111415] items-center justify-center relative pb-1">
                <div className="w-[120px] h-[4px] bg-[#e1e3e4]/30 rounded-full"></div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Playstore branding & system synchronization metadata footer */}
      <footer className="hidden sm:block w-full py-4 px-6 border-t border-[#1d2021] text-center text-[10px] text-[#8f9194] space-y-1 mt-auto">
        <p>HabitFlow AI Companion App is packaged and compilable via standard Gradle toolchains.</p>
        <p className="font-mono text-[9px] tracking-widest text-[#95d4b3]">GOOGLE PLAY CANDIDATE BUILDS • ZERO DATA SPOOF</p>
      </footer>
    </div>
  );
}
