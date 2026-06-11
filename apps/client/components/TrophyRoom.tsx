import React, { useState } from "react";
import { useHabitStore } from "../store/useHabitStore";

export const TrophyRoom: React.FC = () => {
  const {
    milestones,
    leaderboard,
    userXP,
    userLevel,
    userName,
    userTitle
  } = useHabitStore();

  const targetXP = 5000;
  const xpPercentage = Math.round((userXP / targetXP) * 100);

  // Generate 28 cells for a 4-week commitment calendar heatmap (mock stability)
  const [hoveredCell, setHoveredCell] = useState<{ day: number; level: number } | null>(null);

  const heatmapData = [
    { day: 1, level: 3, date: "May 14" },
    { day: 2, level: 2, date: "May 15" },
    { day: 3, level: 0, date: "May 16" },
    { day: 4, level: 3, date: "May 17" },
    { day: 5, level: 4, date: "May 18" },
    { day: 6, level: 4, date: "May 19" },
    { day: 7, level: 3, date: "May 20" },

    { day: 8, level: 2, date: "May 21" },
    { day: 9, level: 1, date: "May 22" },
    { day: 10, level: 3, date: "May 23" },
    { day: 11, level: 0, date: "May 24" },
    { day: 12, level: 4, date: "May 25" },
    { day: 13, level: 3, date: "May 26" },
    { day: 14, level: 4, date: "May 27" },

    { day: 15, level: 3, date: "May 28" },
    { day: 16, level: 2, date: "May 29" },
    { day: 17, level: 4, date: "May 30" },
    { day: 18, level: 1, date: "May 31" },
    { day: 19, level: 3, date: "June 1" },
    { day: 20, level: 3, date: "June 2" },
    { day: 21, level: 4, date: "June 3" },

    { day: 22, level: 4, date: "June 4" },
    { day: 23, level: 3, date: "June 5" },
    { day: 25, level: 1, date: "June 7" },
    { day: 24, level: 4, date: "June 6" },
    { day: 26, level: 4, date: "June 8" },
    { day: 27, level: 3, date: "June 9" },
    { day: 28, level: 4, date: "June 10" },
  ];

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 0: return "bg-[#111415] border-[#44474a]/20"; // Zero
      case 1: return "bg-[#12533a]/20 border-[#12533a]/30"; // Very low
      case 2: return "bg-[#12533a]/50 border-[#12533a]/60"; // Moderate
      case 3: return "bg-[#95d4b3]/60 border-[#95d4b3]/30 text-[#002114]"; // High
      case 4: return "bg-[#95d4b3] border-[#b1f0ce] text-[#002114] glow-secondary"; // Full Peak
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">MILITARY STRENGTH STREAKS</span>
        <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Trophy Room & XP</h1>
      </div>

      {/* Progress Level Slider Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1d2021] to-[#12533a]/10 border border-[#8f9194]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#95d4b3]">FLOW RANK DESIGNATION</span>
            <h2 className="text-2xl font-bold font-display text-[#e1e3e4] mt-0.5">{userName} — "{userTitle || "Novice"}" Level {userLevel}</h2>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs text-[#c5c6ca]">{userXP} XP / {targetXP} XP</span>
            <span className="text-[10px] text-[#8f9194] block">Next Rank: Master of Cognitive Flow</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-[#111415] rounded-full overflow-hidden border border-[#44474a]/40">
          <div 
            style={{ width: `${xpPercentage}%` }}
            className="h-full bg-gradient-to-r from-[#95d4b3] to-[#e9c176] rounded-full transition-all duration-700"
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Milestone Badges */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8f9194]">MILITARY-GRADE METALLIC SCHEMES</span>
            <h3 className="text-xl font-bold text-[#e1e3e4] mt-1 mb-4">Milestone Badges</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {milestones.map((ms) => {
                const isUnlocked = ms.unlockedAt !== null;
                return (
                  <div
                    key={ms.id}
                    id={`badge-card-${ms.id}`}
                    className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                      isUnlocked 
                        ? "border-[#95d4b3]/40 bg-[#12533a]/10 hover:border-[#95d4b3]/60 group" 
                        : "border-[#44474a]/30 bg-[#191c1d]/40 opacity-70"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Metallic Shimmer Icon */}
                      <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center relative ${
                        isUnlocked 
                          ? "bg-gradient-to-br from-[#95d4b3]/30 to-[#e9c176]/30 text-[#e9c176] glow-tertiary" 
                          : "bg-[#111415] text-[#8f9194]"
                      }`}>
                        {/* Metallic reflection shimmer */}
                        {isUnlocked && (
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                        )}
                        <span className="material-symbols-outlined text-3xl">{ms.icon}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#e1e3e4]">{ms.name}</h4>
                          {!isUnlocked && (
                            <span className="material-symbols-outlined text-xs text-[#ffb4ab]">lock</span>
                          )}
                        </div>
                        <p className="text-xs text-[#c5c6ca]/80 leading-relaxed">{ms.description}</p>
                        
                        {/* Progress indicator */}
                        <div className="pt-2 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[#8f9194]">Target: {ms.currentCount}/{ms.targetCount}</span>
                          <span className={`${isUnlocked ? "text-[#95d4b3]" : "text-[#e9c176]"}`}>
                            {isUnlocked ? "UNLOCKED" : "ACTIVE TASK"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Consistency Heatmap */}
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#8f9194]">TEMPORAL DENSITY ANALYSIS</span>
                <h3 className="text-xl font-bold text-[#e1e3e4] mt-0.5">Commitment Heatmap</h3>
              </div>
              <div className="flex gap-1.5 items-center font-mono">
                <span className="text-[10px] text-[#8f9194]">Low</span>
                <div className="w-2.5 h-2.5 bg-[#12533a]/20 rounded-xs"></div>
                <div className="w-2.5 h-2.5 bg-[#12533a]/50 rounded-xs"></div>
                <div className="w-2.5 h-2.5 bg-[#95d4b3]/60 rounded-xs"></div>
                <div className="w-2.5 h-2.5 bg-[#95d4b3] rounded-xs"></div>
                <span className="text-[10px] text-[#8f9194]">Peak</span>
              </div>
            </div>
            <p className="text-xs text-[#c5c6ca] mb-4">
              Your overall commitment frequency metrics over the last 28 days. Hover over any node block to query precise circadian focus stability points.
            </p>

            <div className="grid grid-cols-7 gap-2 p-4 bg-[#111415]/75 rounded-xl border border-[#44474a]/20">
              {heatmapData.map((cell) => (
                <div
                  key={cell.day}
                  id={`heatmap-cell-${cell.day}`}
                  onMouseEnter={() => setHoveredCell({ day: cell.day, level: cell.level })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`aspect-square sm:h-12 flex flex-col items-center justify-center rounded-md border text-center transition-all cursor-pointer relative ${getHeatmapColor(cell.level)}`}
                >
                  <span className="text-[10px] font-mono font-medium opacity-40">{cell.day}</span>
                </div>
              ))}
            </div>

            {/* Hover inspection reporter */}
            <div className="mt-3 text-center min-h-[24px]">
              {hoveredCell ? (
                <p id="heatmap-inspection-text" className="text-xs text-[#95d4b3] font-mono">
                  Day {hoveredCell.day}: Commitment Density level {hoveredCell.level}/4 (Circadian wake sync confirmed).
                </p>
              ) : (
                <p className="text-xs text-[#8f9194] font-mono">Hover a calendar grid coordinate.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: XP Velocity & Leaderboards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8f9194]">XP VELOCITY</span>
            <h3 className="text-lg font-bold text-[#e1e3e4] mt-0.5 mb-3">Historic Gains</h3>

            <div className="space-y-2.5 font-sans">
              {[
                { label: "Deep focus hour completed", value: "+850 XP", cat: "focus" },
                { label: "Circadian alignment routine done", value: "+240 XP", cat: "focus" },
                { label: "Water target goal unlocked", value: "+150 XP", cat: "wellness" },
                { label: "Somatic mind state logged", value: "+100 XP", cat: "mind" },
              ].map((xp, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-[#111415]/60 border border-[#44474a]/15 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      xp.cat === "focus" ? "bg-[#e9c176]" : xp.cat === "wellness" ? "bg-[#95d4b3]" : "bg-blue-400"
                    }`}></span>
                    <span className="text-[#c5c6ca] font-medium">{xp.label}</span>
                  </div>
                  <span className="font-mono font-bold text-[#95d4b3]">{xp.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Leaderboard ranking */}
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#8f9194]">COMMUNITY SYNCHRONY</span>
              <span className="material-symbols-outlined text-[#e9c176] text-lg">emoji_events</span>
            </div>
            <h3 className="text-md font-bold text-[#e1e3e4] mb-3">Peer Leaderboard</h3>

            <div className="space-y-2">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    user.isSelf 
                      ? "border-[#95d4b3] bg-[#12533a]/25 text-[#95d4b3] glow-secondary" 
                      : "border-[#44474a]/20 bg-[#111415]/60 text-[#c5c6ca]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="font-mono font-bold text-[#8f9194] w-4">{user.rank}.</span>
                    <span className="text-lg">{user.avatar}</span>
                    <div>
                      <span className="font-semibold block">{user.name}</span>
                      <span className="text-[10px] font-mono text-[#8f9194]">Level {user.level}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs">{user.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
