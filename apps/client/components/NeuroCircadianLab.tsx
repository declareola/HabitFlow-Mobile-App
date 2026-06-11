import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHabitStore } from "../store/useHabitStore";

export const NeuroCircadianLab: React.FC = () => {
  const { awardXP, updateSettings, updateProfile } = useHabitStore();

  // Simulation Sliders
  const [sleepLateOffset, setSleepLateOffset] = useState<number>(0.5); // hours late to bed
  const [hydrationLiters, setHydrationLiters] = useState<number>(2.5); // liters/day
  const [caffeineHourOffset, setCaffeineHourOffset] = useState<number>(6); // hours before bed
  const [sunsetScreentime, setSunsetScreentime] = useState<number>(45); // min of exposure before sleep

  // Audio Synthesis States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [binauralFreq, setBinauralFreq] = useState<number>(10); // Alpha wave: 10Hz, Theta: 6Hz, Beta: 15Hz
  const [noiseVolume, setNoiseVolume] = useState<number>(0.15); // Brownian noise volume
  const [sinVolume, setSinVolume] = useState<number>(0.1); // Synth oscillator volume
  const [solfeggioFreq, setSolfeggioFreq] = useState<number>(528); // 528Hz cosmic focus

  const [simulationApplied, setSimulationApplied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"simulator" | "binaural">("simulator");

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio Nodes
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const pannerLeftRef = useRef<StereoPannerNode | null>(null);
  const pannerRightRef = useRef<StereoPannerNode | null>(null);
  const solfeggioOscRef = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  
  const oscGainRef = useRef<GainNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const solfeggioGainRef = useRef<GainNode | null>(null);

  // Stop sound if component unmounts
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Update volumes in real-time when sliders change
  useEffect(() => {
    if (noiseGainRef.current && audioCtxRef.current) {
      noiseGainRef.current.gain.linearRampToValueAtTime(noiseVolume, audioCtxRef.current.currentTime + 0.1);
    }
  }, [noiseVolume]);

  useEffect(() => {
    if (oscGainRef.current && audioCtxRef.current) {
      oscGainRef.current.gain.linearRampToValueAtTime(sinVolume, audioCtxRef.current.currentTime + 0.1);
    }
  }, [sinVolume]);

  useEffect(() => {
    if (solfeggioGainRef.current && audioCtxRef.current) {
      solfeggioGainRef.current.gain.linearRampToValueAtTime(
        solfeggioFreq === 0 ? 0 : sinVolume * 0.4, 
        audioCtxRef.current.currentTime + 0.1
      );
    }
  }, [solfeggioFreq, sinVolume]);

  useEffect(() => {
    if (leftOscRef.current && rightOscRef.current && audioCtxRef.current) {
      const baseFreq = 180; // 180Hz carrier wave
      leftOscRef.current.frequency.setValueAtTime(baseFreq, audioCtxRef.current.currentTime);
      rightOscRef.current.frequency.setValueAtTime(baseFreq + binauralFreq, audioCtxRef.current.currentTime);
    }
  }, [binauralFreq]);

  const initAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      
      const ctx = audioCtxRef.current;
      
      // Gain node controls
      oscGainRef.current = ctx.createGain();
      noiseGainRef.current = ctx.createGain();
      solfeggioGainRef.current = ctx.createGain();

      oscGainRef.current.gain.value = sinVolume;
      noiseGainRef.current.gain.value = noiseVolume;
      solfeggioGainRef.current.gain.value = sinVolume * 0.4;

      // Binaural Oscillators (Left: Carrier, Right: Carrier + Binaural Frequency)
      leftOscRef.current = ctx.createOscillator();
      rightOscRef.current = ctx.createOscillator();
      
      leftOscRef.current.type = "sine";
      rightOscRef.current.type = "sine";

      const baseFreq = 180;
      leftOscRef.current.frequency.value = baseFreq;
      rightOscRef.current.frequency.value = baseFreq + binauralFreq;

      // Stereo Pans for Binaural isolation
      if (ctx.createStereoPanner) {
        pannerLeftRef.current = ctx.createStereoPanner();
        pannerRightRef.current = ctx.createStereoPanner();
        pannerLeftRef.current.pan.value = -1; // hard left
        pannerRightRef.current.pan.value = 1;  // hard right

        leftOscRef.current.connect(oscGainRef.current).connect(pannerLeftRef.current).connect(ctx.destination);
        rightOscRef.current.connect(oscGainRef.current).connect(pannerRightRef.current).connect(ctx.destination);
      } else {
        // Fallback if Panner not supported
        leftOscRef.current.connect(oscGainRef.current).connect(ctx.destination);
        rightOscRef.current.connect(oscGainRef.current).connect(ctx.destination);
      }

      // Solfeggio Cosmic Tuner
      solfeggioOscRef.current = ctx.createOscillator();
      solfeggioOscRef.current.type = "triangle";
      solfeggioOscRef.current.frequency.value = solfeggioFreq;
      solfeggioOscRef.current.connect(solfeggioGainRef.current).connect(ctx.destination);

      // Synthesizing procedural brown noise (deep focus rumbles)
      // Custom brown noise generator script-processor fallback
      const bufferSize = 4096;
      let lastOut = 0.0;
      noiseNodeRef.current = ctx.createScriptProcessor(bufferSize, 1, 1);
      noiseNodeRef.current.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain coefficient for brown sweep
        }
      };
      
      noiseNodeRef.current.connect(noiseGainRef.current).connect(ctx.destination);

      // Start all nodes
      leftOscRef.current.start(0);
      rightOscRef.current.start(0);
      solfeggioOscRef.current.start(0);

      setIsPlaying(true);
    } catch (e) {
      console.error("Web Audio API not supported or context blocked by browser", e);
    }
  };

  const stopAudio = () => {
    try {
      if (leftOscRef.current) { leftOscRef.current.stop(); leftOscRef.current.disconnect(); leftOscRef.current = null; }
      if (rightOscRef.current) { rightOscRef.current.stop(); rightOscRef.current.disconnect(); rightOscRef.current = null; }
      if (solfeggioOscRef.current) { solfeggioOscRef.current.stop(); solfeggioOscRef.current.disconnect(); solfeggioOscRef.current = null; }
      if (noiseNodeRef.current) { noiseNodeRef.current.disconnect(); noiseNodeRef.current = null; }
      if (audioCtxRef.current) { audioCtxRef.current.close().then(() => audioCtxRef.current = null); }
      setIsPlaying(false);
    } catch (err) {
      console.warn("Could not teardown Web Audio Context gracefully:", err);
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      initAudio();
    }
  };

  // --- CALCULATION LOGIC: NEURO CIRCADIAN FATIGUE ---
  // Sleep offset penalty: larger offset yields lower morning baseline energy.
  // Screentime penalty: delays natural melatonin, shifting circadian curve.
  // Caffeine penalty: increases late-night cortisol, blocking deep recovery cycles.
  // Hydration benefit: helps metabolic clearance, buffer fatigue.
  
  const baseEnergy = Math.max(10, 95 - (sleepLateOffset * 15) - (sunsetScreentime * 0.4) + (hydrationLiters * 6));
  const burnoutRiskScore = Math.min(100, Math.max(5, 
    (sleepLateOffset * 22) + 
    (sunsetScreentime * 0.6) + 
    (caffeineHourOffset < 8 ? (8 - caffeineHourOffset) * 12 : 0) - 
    (hydrationLiters * 10) + 30
  ));

  const getBurnoutRating = (score: number) => {
    if (score < 30) return { label: "EXCELLENT ADAPTABILITY", color: "text-[#95d4b3]", desc: "Highly balanced prefrontal cortex state. Excellent cognitive resilience." };
    if (score < 55) return { label: "MILD INTELLECTUAL FATIGUE", color: "text-[#e9c176]", desc: "Cognitive resources starting to stress. Recommended 15 min NSDR break." };
    if (score < 78) return { label: "HIGH CHRONIC STRAIN", color: "text-orange-400", desc: "Frontal lobe latency detected. Delayed reaction times, high sugar cravings." };
    return { label: "SEVERE CRITICAL BURNOUT RISK", color: "text-[#ffb4ab]", desc: "Prefrontal cortex depleted. High risk of sympathetic overload and task friction." };
  };

  const rating = getBurnoutRating(burnoutRiskScore);

  const handleApplySimulatorAction = () => {
    setSimulationApplied(true);
    awardXP(250); // Generous reward for strategic bio-rhythm configuration

    // Commit high-precision values to general store
    updateSettings({
      strictBlockMode: burnoutRiskScore > 60, // automatically escalate strictness if strain risk is high
      soundscapeVolume: Math.round(noiseVolume * 100),
      coachSensitivity: Math.round(burnoutRiskScore)
    });

    // Update profile bio context to include active protocol details
    updateProfile({
      focusTarget: Math.max(3.5, Number((8.5 - (burnoutRiskScore / 18)).toFixed(1))), // Scale target work downwards to protect depleting frontal lobe
      soundscapeTrack: `Beta/Alpha ${binauralFreq}Hz Hybrid Generator`,
      activeSoundscapeTimer: "Calibrated to current rest index"
    });

    setTimeout(() => {
      setSimulationApplied(false);
    }, 4000);
  };

  // Mock static timeline values for the visual SVG graph
  // Creates a clean, smooth wave illustrating Sleep pressure and PFC Energy
  const getSimPathPoints = () => {
    const energyPoints = [];
    const melatoninPoints = [];
    
    // Calculate custom offset curves based on sliders
    const delayShift = (sleepLateOffset * 8) + (sunsetScreentime / 8);
    
    for (let x = 0; x <= 100; x += 5) {
      // Energy curve model: high in morning, drops, rebounds slightly, crashes
      const energyY = 85 - (x / 2) + Math.sin((x - delayShift) * 0.12) * 22 + (hydrationLiters * 3) - (sleepLateOffset * 6);
      energyPoints.push(`${x * 3.2},${140 - Math.min(130, Math.max(10, energyY))}`);

      // Melatonin curve model: lowest at mid-day, ramps up at dusk
      const melatoninY = 5 + Math.max(0, Math.pow(x - delayShift, 2) / 45) * (1 - (sunsetScreentime / 130));
      melatoninPoints.push(`${x * 3.2},${140 - Math.min(130, Math.max(5, melatoninY))}`);
    }

    return {
      energyPath: `M ${energyPoints.join(" L ")}`,
      melatoninPath: `M ${melatoninPoints.join(" L ")}`
    };
  };

  const { energyPath, melatoninPath } = getSimPathPoints();

  return (
    <div className="space-y-6">
      
      {/* Simulation Applied Banner */}
      <AnimatePresence>
        {simulationApplied && (
          <motion.div
            id="simulation-applied-alert"
            initial={{ opacity: 0, y: -25, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -25, x: "-50%" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#12533a] border border-[#95d4b3] text-[#95d4b3] px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3.5"
          >
            <span className="material-symbols-outlined text-[18px] animate-bounce">science</span>
            <div className="text-left">
              <span className="font-bold text-xs block text-white">Adaptive Protocol Transferred</span>
              <span className="text-[10px] text-[#95d4b3] block font-mono uppercase tracking-wider">Focus thresholds auto-scaled. +250 XP Awarded.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1d2021] to-[#261900]/20 p-6 rounded-2xl border border-[#8f9194]/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#e9c176]/5 rounded-full blur-[90px] pointer-events-none"></div>
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#e9c176] font-bold">BIOLOGICAL ADAPTABILITY CLINICAL ENGINE</span>
          <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Neuro-Circadian Laboratory</h1>
          <p className="text-[#c5c6ca] text-xs leading-relaxed mt-1 max-w-2xl">
            Simulate your prefrontal cortex durability, run biological safety risk audits, and mix generative binaural waves linked directly into your active ritual stacks.
          </p>
        </div>

        {/* Tab Controllers */}
        <div className="flex gap-1 bg-[#111415] p-1 rounded-xl border border-[#323536] self-start md:self-center shrink-0">
          <button
            id="lab-tab-simulator"
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
              activeTab === "simulator" ? "bg-[#323536] text-[#95d4b3]" : "text-[#8f9194] hover:text-[#c5c6ca] bg-transparent"
            }`}
          >
            CIRCADIAN SIMULATOR
          </button>
          <button
            id="lab-tab-binaural"
            type="button"
            onClick={() => setActiveTab("binaural")}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
              activeTab === "binaural" ? "bg-[#323536] text-[#e9c176]" : "text-[#8f9194] hover:text-[#c5c6ca] bg-transparent"
            }`}
          >
            BINAURAL AUDIO MIXER
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "simulator" ? (
          <motion.div
            key="simulator-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            
            {/* Simulator Inputs */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#323536]/40">
                <span className="material-symbols-outlined text-[#e9c176] text-sm">tune</span>
                <span className="font-mono text-xs uppercase tracking-wider text-[#e9c176] font-bold">Adjust Experimental Inputs</span>
              </div>

              {/* Slider 1: Bedtime Latency */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#e1e3e4]">Sleep Window Latency</span>
                  <span className="font-mono text-[#ffb4ab] font-bold">+{sleepLateOffset} hrs late</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.5"
                  value={sleepLateOffset}
                  onChange={(e) => setSleepLateOffset(parseFloat(e.target.value))}
                  className="w-full accent-[#ffb4ab] h-1 bg-[#323536] rounded-lg cursor-pointer"
                />
                <span className="block text-[9px] text-[#8f9194]">Delays peak morning cortisol surge levels.</span>
              </div>

              {/* Slider 2: Sunset Screentime */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#e1e3e4]">Bedtime High-Intensity Screentime</span>
                  <span className="font-mono text-[#e9c176] font-bold">{sunsetScreentime} min</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={sunsetScreentime}
                  onChange={(e) => setSunsetScreentime(parseInt(e.target.value))}
                  className="w-full accent-[#e9c176] h-1 bg-[#323536] rounded-lg cursor-pointer"
                />
                <span className="block text-[9px] text-[#8f9194]">Screentime lux disrupts melatonin synthesis parameters.</span>
              </div>

              {/* Slider 3: Afternoon Caffeine Offset */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#e1e3e4]">Last Caffeine Intake Location</span>
                  <span className="font-mono text-purple-300 font-bold">{caffeineHourOffset} hrs before bed</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  step="1"
                  value={caffeineHourOffset}
                  onChange={(e) => setCaffeineHourOffset(parseInt(e.target.value))}
                  className="w-full accent-purple-400 h-1 bg-[#323536] rounded-lg cursor-pointer"
                />
                <span className="block text-[9px] text-[#8f9194]">Adenosine receptor blocks continue past 8-hour half-life durations.</span>
              </div>

              {/* Slider 4: Hydration */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-[#e1e3e4]">Fluid Intake Load</span>
                  <span className="font-mono text-blue-400 font-bold">{hydrationLiters} Liters/day</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.5"
                  step="0.5"
                  value={hydrationLiters}
                  onChange={(e) => setHydrationLiters(parseFloat(e.target.value))}
                  className="w-full accent-blue-400 h-1 bg-[#323536] rounded-lg cursor-pointer"
                />
                <span className="block text-[9px] text-[#8f9194]">Enhances synaptic clarity and physical performance benchmarks.</span>
              </div>

              {/* Action Apply button */}
              <button
                type="button"
                onClick={handleApplySimulatorAction}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#95d4b3] to-[#e9c176] text-[#002114] font-bold text-xs hover:opacity-95 cursor-pointer shadow-lg shadow-[#95d4b3]/10 border-none transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm font-black">bolt</span>
                APPLY DEFENSIVE PROTOCOL COUPLING
              </button>
            </div>

            {/* Simulated Clinical Results Graph */}
            <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10">
              <div className="space-y-1">
                <span className="font-mono text-[10px] tracking-widest text-[#8f9194] uppercase">PREDICTIVE STYLES SCHEME</span>
                <h3 className="text-lg font-bold text-[#e1e3e4]">Predictive Biological Curve (24h Wave)</h3>
                <p className="text-[11px] text-[#c5c6ca]">
                  Models how your prefrontal stamina decreases relative to screen, timing, and hydration indices.
                </p>
              </div>

              {/* Responsive SVG Curve chart */}
              <div className="my-5 w-full bg-[#111415] rounded-xl p-4 border border-[#323536] relative overflow-hidden h-44">
                <svg className="w-full h-full" viewBox="0 0 320 140" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="35" x2="320" y2="35" stroke="#323536" strokeDasharray="3,3" />
                  <line x1="0" y1="70" x2="320" y2="70" stroke="#323536" strokeDasharray="3,3" />
                  <line x1="0" y1="105" x2="320" y2="105" stroke="#323536" strokeDasharray="3,3" />
                  
                  {/* Paths */}
                  <path d={energyPath} fill="none" stroke="#95d4b3" strokeWidth="2.5" />
                  <path d={melatoninPath} fill="none" stroke="#e9c176" strokeWidth="2" strokeDasharray="3" />
                </svg>

                {/* Legend badges */}
                <div className="absolute top-2 left-2 flex gap-4 text-[9px] font-mono uppercase bg-[#111415]/95 px-2 py-1.5 rounded border border-[#323536]/80 backdrop-blur">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#95d4b3] rounded-full"></span>
                    <span className="text-[#95d4b3] font-bold">PFC Executive Energy (Lobe)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#e9c176] rounded-full"></span>
                    <span className="text-[#e9c176] font-bold">Biological Melatonin Pressure</span>
                  </div>
                </div>

                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-[#8f9194]">
                  08:00 AM ↗ DAY ↗ 10:00 PM ↗ SLEEP
                </div>
              </div>

              {/* Predictive Burnout Risk Panel */}
              <div className="p-4 bg-[#111415]/80 rounded-xl border border-[#323536] space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-[#323536]/40">
                  <div className="text-left">
                    <span className="block text-[8px] font-mono text-[#8f9194] uppercase tracking-wider">PRED_FATIGUE_DIVERGENCE</span>
                    <span className={`block font-bold text-sm tracking-tight ${rating.color}`}>
                      {rating.label}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-2xl font-black text-[#e1e3e4]">{Math.round(burnoutRiskScore)}<span className="text-xs font-semibold text-[#8f9194]">%</span></span>
                    <span className="block text-[8px] font-mono text-[#8f9194] uppercase">PREDICTIVE RISKS</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-between items-start text-xs">
                  <p className="text-[#c5c6ca] leading-relaxed select-none">
                    {rating.desc}
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#261900]/30 border border-[#e9c176]/15 text-[10px] text-[#e9c176] font-mono w-48 shrink-0 text-center">
                    ☀️ Early Sunlight Recommendation: {sunsetScreentime > 50 ? "Recommend 15-minute sunshine offset." : "Adhering nicely."}
                  </div>
                </div>
              </div>

            </div>

          </motion.div>
        ) : (
          <motion.div
            key="binaural-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            
            {/* Binaural explanation */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-[#323536]/40 mb-4">
                  <span className="material-symbols-outlined text-purple-400 text-sm">waves</span>
                  <span className="font-mono text-xs uppercase tracking-wider text-purple-400 font-bold">Generative Synthesizer Info</span>
                </div>
                <h3 className="text-[#e1e3e4] font-semibold text-sm mb-2">Binaural isolation Technology</h3>
                <p className="text-[#c5c6ca] text-xs leading-relaxed">
                  Unlike passive stock music file layers, our <strong>Binaural Focus Engine</strong> synthesizes procedural tone carriers in real time using your browser's audio nodes.
                  <br className="mb-2" />
                  Your left and right auditory sensors receive slightly offset signals, triggering precise brain wave entrainment loops (Alpha waves at 10Hz to stabilize logical focus, Solfeggio waves at 528Hz to decrease blood pressure dynamics).
                </p>
              </div>

              <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] text-[#e9c176] leading-relaxed flex gap-2">
                <span className="material-symbols-outlined text-sm font-bold shrink-0 animate-bounce">headphones</span>
                <span>🎧 <strong>Stereo Headphones Required</strong>: Isolation of left and right carrier paths is essential for entraining brain waves.</span>
              </div>
            </div>

            {/* Synthesizer Control Deck */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-6">
              
              <div className="flex justify-between items-center bg-[#111415] p-4 rounded-xl border border-[#323536]">
                <div className="text-left">
                  <span className="block text-[8px] font-mono text-[#8f9194] uppercase tracking-wider">carrier_engine_state</span>
                  <span className="block font-bold text-xs text-[#e1e3e4] uppercase font-mono">
                    {isPlaying ? "⚡ OSCILLATORS ENGAGED (GENERATING REAL TIME)" : "■ OFF / STANDBY"}
                  </span>
                </div>

                <button
                  id="lab-oscillator-play-trigger"
                  type="button"
                  onClick={handlePlayToggle}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider cursor-pointer border-none transition-all flex items-center gap-2 ${
                    isPlaying 
                      ? "bg-[#ffb4ab] text-red-950 hover:bg-[#ffdad6]" 
                      : "bg-[#95d4b3] text-[#002114] hover:bg-[#b1f0ce] shadow"
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">
                    {isPlaying ? "pause_circle" : "play_circle"}
                  </span>
                  {isPlaying ? "HALT AUDIO WAVE" : "INITIALIZE OSCILLATORS"}
                </button>
              </div>

              {/* Synthesizer parameter sliders */}
              <div className="space-y-4 bg-[#111415]/50 p-4 rounded-xl border border-[#323536]/60">
                
                {/* Entrainment frequency select */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-[#e1e3e4]">Brainwave Modulation Frequency</span>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      {binauralFreq}Hz ({binauralFreq === 6 ? "Theta-Sleep" : binauralFreq === 10 ? "Alpha-Flow" : "Beta-Stamina"})
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: "Theta Sync (6Hz)", v: 6, desc: "Relaxation, NSDR support" },
                      { l: "Alpha Flow (10Hz)", v: 10, desc: "High creative focus" },
                      { l: "Beta Stamina (15Hz)", v: 15, desc: "Fast analytical thinking" }
                    ].map((item) => (
                      <button
                        key={item.v}
                        type="button"
                        onClick={() => {
                          setBinauralFreq(item.v);
                          if (oscGainRef.current) awardXP(50);
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                          binauralFreq === item.v 
                            ? "bg-purple-950/40 text-purple-300 border-purple-400" 
                            : "bg-[#1d2021]/60 hover:bg-[#1d2021] text-[#8f9194] border-[#323536]"
                        }`}
                      >
                        <span className="block">{item.l}</span>
                        <span className="block text-[8px] font-normal text-[#8f9194] mt-1 pr-1 truncate font-mono">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub Tone Volume (Sine carrier) */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-semibold text-[#e1e3e4]">Carrier Sub Tone Volume</span>
                    <span className="font-mono text-purple-300 font-bold">{Math.round(sinVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.4"
                    step="0.02"
                    value={sinVolume}
                    onChange={(e) => setSinVolume(parseFloat(e.target.value))}
                    className="w-full accent-purple-400 h-1 bg-[#323536] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Brownian Noise Sweep Volume */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-semibold text-[#e1e3e4]">Deep Brown focus Sweep</span>
                    <span className="font-mono text-[#95d4b3] font-bold">{Math.round(noiseVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.02"
                    value={noiseVolume}
                    onChange={(e) => setNoiseVolume(parseFloat(e.target.value))}
                    className="w-full accent-[#95d4b3] h-1 bg-[#323536] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Cosmic Solfeggio select */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-[#e1e3e4]">Cosmic Solfeggio Harmonic frequency</span>
                    <span className="text-xs font-mono font-bold text-[#e1e3e4]">
                      {solfeggioFreq === 0 ? "MUTED / NONE" : `${solfeggioFreq}Hz Core Harmonic`}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { l: "MUTE", v: 0 },
                      { l: "396Hz (Grief)", v: 396 },
                      { l: "432Hz (Nature)", v: 432 },
                      { l: "528Hz (Transformation)", v: 528 }
                    ].map((h) => (
                      <button
                        key={h.v}
                        type="button"
                        onClick={() => {
                          setSolfeggioFreq(h.v);
                          if (oscGainRef.current) awardXP(50);
                        }}
                        className={`p-2 rounded-xl text-[11px] font-mono font-bold transition-all border cursor-pointer border-[#323536] ${
                          solfeggioFreq === h.v 
                            ? "bg-[#12533a]/30 text-[#95d4b3] border-[#95d4b3]/60 font-black" 
                            : h.v === 0 ? "bg-white/5 hover:bg-white/10 text-[#8f9194]" : "bg-[#1d2021]/60 hover:bg-[#1d2021] text-[#c5c6ca]"
                        }`}
                      >
                        {h.l}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Dynamic visual graphic showing wave frequency ripples (equalizer imitation) */}
              <div className="flex items-center justify-center gap-1.5 h-10 w-full pt-2">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-purple-500 to-[#95d4b3] rounded-full"
                    animate={isPlaying ? {
                      height: [15, Math.max(10, Math.sin(i * 1.3) * (noiseVolume > 0.1 ? noiseVolume * 70 : 25)), 15]
                    } : {
                      height: [10, 10, 10]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + (i % 5) * 0.15,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
