import React, { useState } from "react";
import { motion } from "motion/react";
import { useHabitStore } from "../store/useHabitStore";
import { haptics } from "../hooks/useHaptics";

export const WellnessLogger: React.FC = () => {
  const { metrics, logWellness, timezone } = useHabitStore();
  const latestLog = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  // Local temporary staging states
  const [waterAmount, setWaterAmount] = useState<number>(latestLog ? latestLog.waterIntake : 2.0); // Liters
  const [sleepValue, setSleepValue] = useState<number>(latestLog ? latestLog.sleepScore : 80); // Sleep score
  const [sleepHrs, setSleepHrs] = useState<number>(latestLog ? latestLog.sleepHours : 7.2);
  const [mindState, setMindState] = useState<"Focus" | "Calm" | "Nervous" | "Tired">(latestLog ? latestLog.mindState : "Focus");
  const [gratitudeText, setGratitudeText] = useState("");
  const [beverage, setBeverage] = useState<string>("Mineral Water");
  const [bevDropdownOpen, setBevDropdownOpen] = useState(false);
  const [bevSearch, setBevSearch] = useState("");

  interface RegionalBeverage {
    name: string;
    icon: string;
    desc: string;
    size: number; // serving size in Liters
    hydration: number; // water equivalent efficiency %
    temp: "hot" | "cold" | "ambient";
    caffeine: "none" | "low" | "medium" | "high";
  }

  const getRegionalBeverages = (timezoneStr: string): RegionalBeverage[] => {
    const tz = (timezoneStr || "").toLowerCase();
    
    if (tz.includes("lagos") || tz.includes("africa")) {
      return [
        { name: "Mineral Water", icon: "💧", desc: "Pure hydration source", size: 0.50, hydration: 100, temp: "cold", caffeine: "none" },
        { name: "Zobo Flower Tea", icon: "🌺", desc: "Hibiscus vascular health aid", size: 0.35, hydration: 90, temp: "cold", caffeine: "none" },
        { name: "Moringa Green Tea", icon: "🌿", desc: "West African premium focus brew", size: 0.25, hydration: 95, temp: "hot", caffeine: "low" },
        { name: "Kunun Aya Milk", icon: "🥛", desc: "Energizing mineral tiger nut drink", size: 0.30, hydration: 85, temp: "cold", caffeine: "none" },
        { name: "Palm Sap Hydration", icon: "🌴", desc: "Natural potassium forest nectar", size: 0.40, hydration: 95, temp: "cold", caffeine: "none" },
        { name: "Spiced Ginger Brew", icon: "🫚", desc: "Thermogenic early focus builder", size: 0.20, hydration: 75, temp: "hot", caffeine: "none" },
        { name: "Rooibos Herbal Nectar", icon: "🍂", desc: "Decaf calming cellular renewal", size: 0.35, hydration: 98, temp: "hot", caffeine: "none" },
        { name: "Cocoa Shell Infusion", icon: "🫘", desc: "Mild focus theobromine fuel", size: 0.25, hydration: 88, temp: "hot", caffeine: "low" }
      ];
    } else if (tz.includes("london") || tz.includes("europe") || tz.includes("paris") || tz.includes("berlin") || tz.includes("dublin") || tz.includes("rome") || tz.includes("madrid")) {
      return [
        { name: "Mineral Water", icon: "💧", desc: "Pure chalk downs filtration", size: 0.50, hydration: 100, temp: "cold", caffeine: "none" },
        { name: "English Breakfast Tea", icon: "☕", desc: "Robust concentration focus tannin", size: 0.30, hydration: 90, temp: "hot", caffeine: "high" },
        { name: "Elderflower Hydration", icon: "🌼", desc: "Refreshing floral micro-elements", size: 0.35, hydration: 95, temp: "cold", caffeine: "none" },
        { name: "Double Espresso", icon: "⚡", desc: "Instant prefrontal stimulant", size: 0.06, hydration: 50, temp: "hot", caffeine: "high" },
        { name: "Earl Grey Classic", icon: "🫖", desc: "Bergamot-rested alertness booster", size: 0.25, hydration: 88, temp: "hot", caffeine: "high" },
        { name: "Sparkling Spring Water", icon: "🫧", desc: "Carbonated effervescent refresher", size: 0.40, hydration: 100, temp: "cold", caffeine: "none" },
        { name: "Chamomile Infusion", icon: "🌸", desc: "GABA-activating restorative tea", size: 0.30, hydration: 100, temp: "hot", caffeine: "none" },
        { name: "Oat Milk Flat White", icon: "🥛", desc: "Smooth macro-nutrient focal driver", size: 0.20, hydration: 80, temp: "hot", caffeine: "high" }
      ];
    } else if (tz.includes("tokyo") || tz.includes("asia") || tz.includes("shanghai") || tz.includes("singapore") || tz.includes("seoul")) {
      return [
        { name: "Mineral Water", icon: "💧", desc: "Volcanic mountain basalt stream", size: 0.50, hydration: 100, temp: "cold", caffeine: "none" },
        { name: "Gyokuro Green Tea", icon: "🍵", desc: "Highest L-Theanine focus tool", size: 0.15, hydration: 95, temp: "hot", caffeine: "high" },
        { name: "Barley Mugicha", icon: "🌾", desc: "Roasted decaf circadian hydration", size: 0.40, hydration: 100, temp: "cold", caffeine: "none" },
        { name: "Whisked Matcha", icon: "🍃", desc: "Uji premium stone-ground powder", size: 0.12, hydration: 90, temp: "hot", caffeine: "high" },
        { name: "Oolong Focus Blend", icon: "🍂", desc: "Antioxidant alpha-wave supporter", size: 0.30, hydration: 92, temp: "hot", caffeine: "medium" },
        { name: "Yuzu Electrolyte Water", icon: "🍋", desc: "Aromatic citrus bio-sync", size: 0.35, hydration: 98, temp: "cold", caffeine: "none" },
        { name: "Puerh Aged Tea", icon: "🪵", desc: "Fermented microbial gut-brain tonic", size: 0.20, hydration: 85, temp: "hot", caffeine: "medium" },
        { name: "Ginseng Root Decoction", icon: "🪵", desc: "Adaptogenic circulation builder", size: 0.10, hydration: 70, temp: "hot", caffeine: "none" }
      ];
    } else if (tz.includes("york") || tz.includes("america") || tz.includes("los_angeles") || tz.includes("chicago") || tz.includes("toronto") || tz.includes("sao_paulo") || tz.includes("bogota")) {
      return [
        { name: "Mineral Water", icon: "💧", desc: "Pure glacial aquifer spring", size: 0.50, hydration: 100, temp: "cold", caffeine: "none" },
        { name: "Organic Yerba Mate", icon: "🧉", desc: "Sustained clean stamina nectar", size: 0.40, hydration: 92, temp: "hot", caffeine: "high" },
        { name: "Cold Brew Coffee", icon: "🥤", desc: "High-dose adenosine block agent", size: 0.35, hydration: 75, temp: "cold", caffeine: "high" },
        { name: "Raw Coconut Water", icon: "🥥", desc: "Potassium-loaded isotonic", size: 0.50, hydration: 102, temp: "cold", caffeine: "none" },
        { name: "Live Probiotic Kombucha", icon: "🍾", desc: "Probiotic gut-brain axis support", size: 0.30, hydration: 80, temp: "cold", caffeine: "low" },
        { name: "Hibiscus Lime Cooler", icon: "🍹", desc: "Vascular wellness flush blend", size: 0.45, hydration: 95, temp: "cold", caffeine: "none" },
        { name: "Maple Sap Water", icon: "🍁", desc: "Prebiotic woodland mineral fluid", size: 0.35, hydration: 98, temp: "cold", caffeine: "none" },
        { name: "Apple Cider Vinegar Tonic", icon: "🍎", desc: "Glucose-stabilizing cognitive driver", size: 0.25, hydration: 90, temp: "cold", caffeine: "none" }
      ];
    } else {
      return [
        { name: "Mineral Water", icon: "💧", desc: "Balanced structured water", size: 0.50, hydration: 100, temp: "cold", caffeine: "none" },
        { name: "Gyokuro Green Tea", icon: "🍵", desc: "Metabolic focus catalyst", size: 0.15, hydration: 95, temp: "hot", caffeine: "high" },
        { name: "Black Coffee", icon: "☕", desc: "Pure caffeine focal booster", size: 0.20, hydration: 80, temp: "hot", caffeine: "high" },
        { name: "Salt Electrolytes", icon: "🧬", desc: "Optimized cellular hydration osmolyte", size: 0.35, hydration: 105, temp: "cold", caffeine: "none" },
        { name: "Peppermint Tea", icon: "🌿", desc: "Mental digest refreshment helper", size: 0.30, hydration: 100, temp: "hot", caffeine: "none" },
        { name: "Ginger Lemon Squeeze", icon: "🍋", desc: "Metabolic morning system start", size: 0.25, hydration: 92, temp: "hot", caffeine: "none" },
        { name: "Rooibos Herbal Infusion", icon: "🍂", desc: "Decaf cell-healing protection", size: 0.35, hydration: 98, temp: "hot", caffeine: "none" },
        { name: "Matcha Memory Shake", icon: "🍃", desc: "Brain-boosting stone-ground matcha", size: 0.25, hydration: 85, temp: "cold", caffeine: "high" }
      ];
    }
  };

  const regionalBevs = getRegionalBeverages(timezone || "");
  const currentBevObj = regionalBevs.find((b) => b.name === beverage) || regionalBevs[0];

  const [notification, setNotification] = useState<string | null>(null);

  const incrementWater = () => {
    setWaterAmount((prev) => Math.min(4.0, parseFloat((prev + 0.25).toFixed(2))));
    haptics.light();
  };

  const decrementWater = () => {
    setWaterAmount((prev) => Math.max(0.0, parseFloat((prev - 0.25).toFixed(2))));
    haptics.light();
  };

  // Quick Action to log the precise serving size of the chosen beverage!
  const addSpecificBeverageServing = () => {
    setWaterAmount((prev) => Math.min(4.0, parseFloat((prev + currentBevObj.size).toFixed(2))));
    setNotification(`Logged recommended portion: +${currentBevObj.size * 1000}ml of ${currentBevObj.name}!`);
    haptics.medium();
    setTimeout(() => setNotification(null), 3000);
  };

  // Convert water amount to percentage of daily goal (2.5L target)
  const targetWater = 2.5;
  const waterPercent = Math.min(100, Math.round((waterAmount / targetWater) * 100));

  const handleLogFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logWellness({
      sleepScore: sleepValue,
      sleepHours: sleepHrs,
      waterIntake: waterAmount,
      mindState,
      gratitudeText: gratitudeText.trim() ? gratitudeText.trim() : undefined,
      beverage: beverage
    });

    setNotification("Metrics captured successfully! Your biological balance dashboards have synchronized.");
    setGratitudeText("");
    haptics.success();
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Compute background sky color based on sleep quality score (twilight to cosmos stars)
  const getSkyColorStyle = () => {
    if (sleepValue < 50) return "from-[#111415] to-[#261900]"; // Exhausted brown morning sky
    if (sleepValue < 75) return "from-[#111415] to-[#12533a]/40"; // Mild green rest sky
    return "from-[#0c0f10] via-[#1a1c1e] to-[#12533a]/30"; // Beautiful deep starry night sky gradient
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">CHRONOBIOLOGY LOG BOOK</span>
        <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Biomarker Entry</h1>
      </div>

      {notification && (
        <motion.div
          id="logger-success-toast"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="p-4 rounded-xl bg-[#12533a] border border-[#95d4b3] text-[#95d4b3] text-sm text-center font-medium shadow-lg"
        >
          {notification}
        </motion.div>
      )}

      <form onSubmit={handleLogFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Liquid Consumptions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block mb-2">HYDRATION TRACKER</span>
            <h3 className="text-xl font-bold text-[#e1e3e4] mb-4">Fluid Consumption</h3>

            {/* Custom Interactive Liquid Wave Filling Bowl */}
            <div className="flex flex-col items-center justify-center py-6">
              <div 
                id="liquid-wave-container"
                className="relative w-40 h-40 rounded-full border-4 border-[#323536] overflow-hidden flex items-center justify-center bg-[#111415]"
              >
                {/* Wavy filling water element */}
                <div 
                  style={{ bottom: `${waterPercent - 100}%` }}
                  className="absolute left-1/2 w-[300px] h-[300px] bg-gradient-to-t from-blue-600/60 to-blue-400/80 rounded-[42%] translate-x-[-50%] wave-fill transition-all duration-700 pointer-events-none"
                ></div>

                {/* Liters Text */}
                <div className="z-10 text-center flex flex-col items-center select-none">
                  <span className="text-[#e1e3e4] font-display text-3xl font-extrabold">{waterAmount}L</span>
                  <span className="text-[10px] uppercase font-mono text-[#c5c6ca]">{waterPercent}% of target</span>
                </div>
              </div>

              {/* Incrementor buttons */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  id="fluid-decrement-btn"
                  type="button"
                  onClick={decrementWater}
                  className="w-10 h-10 rounded-full bg-[#1d2021] hover:bg-[#323536] border border-[#44474a] text-[#e1e3e4] flex items-center justify-center font-bold text-lg select-none transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <div className="text-center font-mono">
                  <span className="text-xs text-[#8f9194] block uppercase tracking-wider">Log Cup Size</span>
                  <span className="text-xs font-bold text-[#95d4b3]">+250 ml</span>
                </div>
                <button
                  id="fluid-increment-btn"
                  type="button"
                  onClick={incrementWater}
                  className="w-10 h-10 rounded-full bg-[#12533a]/45 hover:bg-[#12533a] border border-[#95d4b3]/40 text-[#95d4b3] flex items-center justify-center font-bold text-lg select-none transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            {/* Beverage Selector Custom Dropdown / Droplist */}
            <div className="mt-4 pt-4 border-t border-[#44474a]/40 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#8f9194] uppercase tracking-wider block">BEVERAGE PARAMETER SELECTOR</span>
                <span className="font-mono text-[8px] text-[#95d4b3] bg-[#12533a]/30 border border-[#95d4b3]/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
                  📍 {timezone || "Global"}
                </span>
              </div>

              {/* Styled Dropdown Trigger Button */}
              <div className="relative text-left">
                <button
                  id="bev-dropdown-trigger"
                  type="button"
                  onClick={() => setBevDropdownOpen(!bevDropdownOpen)}
                  className="w-full p-3 rounded-xl border border-[#44474a]/60 bg-[#191c1d]/90 hover:bg-[#1d2021] text-[#e1e3e4] text-xs font-medium text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg bg-[#2a2d2f]/50 p-1 rounded-lg">{currentBevObj.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#e1e3e4] text-[11px]">{currentBevObj.name}</span>
                      <span className="text-[9px] text-[#8f9194]">Std Portion: {currentBevObj.size * 1000} ml</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#8f9194] text-lg">
                    {bevDropdownOpen ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {/* Dropdown Options panel */}
                {bevDropdownOpen && (
                  <div
                    id="bev-dropdown-panel"
                    className="absolute z-50 left-0 right-0 mt-1.5 p-2 rounded-xl border border-[#44474a] bg-[#191c1d] shadow-2xl max-h-64 overflow-y-auto space-y-1 scrollbar-none"
                  >
                    {/* Search Field */}
                    <div className="px-1 py-1 border-b border-[#44474a]/30">
                      <input
                        type="text"
                        placeholder="Search local menu..."
                        value={bevSearch}
                        onChange={(e) => setBevSearch(e.target.value)}
                        className="w-full p-2 bg-[#111415] border border-[#44474a]/40 rounded-lg text-xs text-[#e1e3e4] placeholder-[#8f9194] focus:outline-none focus:border-[#e9c176]"
                      />
                    </div>

                    {/* Options List */}
                    <div className="space-y-0.5 pt-1">
                      {regionalBevs
                        .filter((r) => r.name.toLowerCase().includes(bevSearch.toLowerCase()))
                        .map((bev) => (
                          <button
                            key={bev.name}
                            type="button"
                            onClick={() => {
                              setBeverage(bev.name);
                              setBevDropdownOpen(false);
                              setBevSearch("");
                              haptics.light();
                            }}
                            className={`w-full p-2 rounded-lg text-left transition-all flex items-center justify-between hover:bg-[#2a2d2f]/60 cursor-pointer ${
                              beverage === bev.name
                                ? "bg-[#12533a]/25 border border-[#95d4b3]/30 text-[#95d4b3]"
                                : "border border-transparent text-[#c5c6ca]"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base">{bev.icon}</span>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-[11px] truncate">{bev.name}</span>
                                <span className="text-[9px] text-[#8f9194] truncate">{bev.desc}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 font-mono text-[9px] text-[#95d4b3] bg-[#2a2d2f]/40 px-1 py-0.5 rounded ml-2">
                              {bev.size * 1000}ml
                            </div>
                          </button>
                        ))}
                      {regionalBevs.filter((r) => r.name.toLowerCase().includes(bevSearch.toLowerCase())).length === 0 && (
                        <div className="text-center py-4 text-[10px] font-mono text-[#8f9194]">
                          No local match found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic consumption level indicator block */}
              <div 
                id="beverage-analytics-box"
                className="p-3 rounded-xl border border-[#44474a]/35 bg-[#111415]/70 space-y-2"
              >
                <div className="flex justify-between items-center text-[9px] font-mono border-b border-[#44474a]/25 pb-1.5">
                  <span className="text-[#8f9194]">PORTION CONSUMPTION CHARACTERISTICS</span>
                  <span className="text-[#e9c176] font-bold">BIO-METRIC</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-[#c5c6ca]">
                  <div className="flex items-center justify-between p-1 rounded bg-[#191c1d]/55 border border-[#44474a]/20">
                    <span className="text-[#8f9194]">Target Volume:</span>
                    <span className="text-[#e1e3e4] font-bold">{currentBevObj.size * 1000} ml</span>
                  </div>
                  <div className="flex items-center justify-between p-1 rounded bg-[#191c1d]/55 border border-[#44474a]/20">
                    <span className="text-[#8f9194]">Hydration Eq:</span>
                    <span className={`font-bold ${currentBevObj.hydration >= 100 ? "text-[#95d4b3]" : "text-[#e9c176]"}`}>
                      {currentBevObj.hydration}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1 rounded bg-[#191c1d]/55 border border-[#44474a]/20">
                    <span className="text-[#8f9194]">Category:</span>
                    <span className="text-[#e1e3e4] capitalize font-bold">{currentBevObj.temp} brew</span>
                  </div>
                  <div className="flex items-center justify-between p-1 rounded bg-[#191c1d]/55 border border-[#44474a]/20">
                    <span className="text-[#8f9194]">Caffeine load:</span>
                    <span className={`font-bold uppercase text-[8px] px-1 rounded ${
                      currentBevObj.caffeine === "high" ? "bg-red-950/40 text-red-400" :
                      currentBevObj.caffeine === "medium" ? "bg-amber-950/40 text-amber-400" :
                      currentBevObj.caffeine === "low" ? "bg-blue-950/40 text-blue-400" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {currentBevObj.caffeine}
                    </span>
                  </div>
                </div>

                {/* Instant action button for logging exact serving size */}
                <button
                  type="button"
                  onClick={addSpecificBeverageServing}
                  className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-[#12533a]/30 hover:bg-[#12533a]/50 text-[#95d4b3] border border-[#95d4b3]/25 font-bold hover:border-[#95d4b3]/50 text-[9px] tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase font-mono"
                >
                  <span className="material-symbols-outlined text-xs">local_cafe</span>
                  <span>Log Ideal Portion (+{currentBevObj.size * 1000}ml / {currentBevObj.size}L)</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Starry Sleep assessment slider & Mood */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-6 rounded-2xl bg-gradient-to-b ${getSkyColorStyle()} border border-[#8f9194]/10 transition-all duration-500 relative overflow-hidden`}>
            
            {/* Ambient Star Sparkles */}
            {sleepValue > 70 && (
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-4 left-6 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-12 right-24 w-1.5 h-1.5 bg-yellow-100 rounded-full animate-pulse"></div>
                <div className="absolute bottom-16 left-28 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-20 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block">CIRCADIAN SLEEP PROFILE</span>
                <h3 className="text-xl font-bold text-[#e1e3e4] mt-0.5">Sleep Quality assessment</h3>
              </div>
              <span className="material-symbols-outlined text-[#e9c176] text-2xl">bedtime</span>
            </div>

            {/* Slider 1: Sleep Score (0 - 100) */}
            <div className="space-y-2 my-5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#c5c6ca] font-medium">Calculated Rest Score</span>
                <span className="text-[#95d4b3] font-bold text-sm">{sleepValue} points</span>
              </div>
              <input
                id="sleep-score-range-slider"
                type="range"
                min="0"
                max="100"
                value={sleepValue}
                onChange={(e) => setSleepValue(parseInt(e.target.value))}
                className="w-full accent-[#95d4b3] bg-[#323536] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-[#8f9194]">
                <span>Restless</span>
                <span>Optimal REM sync</span>
              </div>
            </div>

            {/* Slider 2: Hours slept */}
            <div className="space-y-2 my-5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#c5c6ca] font-medium font-mono">Rest Hours duration</span>
                <span className="text-blue-400 font-bold text-sm">{sleepHrs} Hours</span>
              </div>
              <input
                id="sleep-hours-range-slider"
                type="range"
                min="4"
                max="12"
                step="0.1"
                value={sleepHrs}
                onChange={(e) => setSleepHrs(parseFloat(e.target.value))}
                className="w-full accent-blue-400 bg-[#323536] h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-4">
            
            {/* Mood selector buttons */}
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block mb-2">PSYCHOLOGICAL SPECTRUM VIBE</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { text: "Focus", icon: "offline_bolt", color: "border-[#e9c176] bg-[#261900]/40 text-[#e9c176]" },
                  { text: "Calm", icon: "filter_vintage", color: "border-[#95d4b3] bg-[#12533a]/30 text-[#95d4b3]" },
                  { text: "Nervous", icon: "grain", color: "border-[#ffb4ab] bg-[#93000a]/20 text-[#ffb4ab]" },
                  { text: "Tired", icon: "bedtime", color: "border-[#87c6a5] bg-[#323536]/50 text-[#c5c6ca]" }
                ].map((item) => (
                  <button
                    key={item.text}
                    id={`mood-btn-${item.text.toLowerCase()}`}
                    type="button"
                    onClick={() => {
                      setMindState(item.text as any);
                      haptics.light();
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                      mindState === item.text
                        ? item.color + " scale-102 font-bold"
                        : "border-[#44474a]/40 bg-[#191c1d]/60 text-[#c5c6ca] hover:border-[#8f9194]/40"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Gratitude text and commit button */}
            <div>
              <label htmlFor="wellness-gratitude" className="font-mono text-[9px] uppercase tracking-widest text-[#8f9194] block mb-2">GRATITUDE REFLECTION (OPTIONAL)</label>
              <input
                id="wellness-gratitude"
                type="text"
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="Log gratitude reflection block to help balance serotonin loops..."
                className="w-full bg-[#111415] border border-[#44474a]/60 rounded-xl p-3 text-xs text-[#e1e3e4] focus:outline-none focus:border-[#e9c176] placeholder-[#8f9194] mb-4"
              />
            </div>

            <button
              id="submit-log-form-btn"
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#95d4b3] to-[#e9c176] text-[#2f3133] font-bold text-sm tracking-wide hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-[#95d4b3]/10 border-none animate-pulse"
            >
              SUBMIT SYSTEM METRICS
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
