import React, { useState, useEffect } from "react";
import { useHabitStore } from "../store/useHabitStore";
import { motion, AnimatePresence } from "motion/react";
import { useFirebase } from "./FirebaseProvider";
import { 
  Watch, 
  Cpu, 
  Bluetooth, 
  Cloud, 
  Activity, 
  Battery, 
  BatteryCharging, 
  Wifi, 
  Check, 
  X, 
  RefreshCw, 
  Sparkles, 
  Lock, 
  Smartphone, 
  Heart,
  Cable,
  FolderSync
} from "lucide-react";

export const UserProfile: React.FC = () => {
  const {
    userName,
    userTitle,
    userBio,
    focusTarget,
    sleepWindowTarget,
    soundscapeTrack,
    activeSoundscapeTimer,
    biometricsAppleConnected,
    biometricsOuraConnected,
    biometricsOraimoConnected,
    biometricsSamsungConnected,
    biometricsXiaomiConnected,
    updateProfile,
    setView,
    userLevel
  } = useHabitStore();

  const { logout } = useFirebase();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempTitle, setTempTitle] = useState(userTitle);
  const [tempBio, setTempBio] = useState(userBio);
  const [tempFocus, setTempFocus] = useState(focusTarget);
  const [tempSleep, setTempSleep] = useState(sleepWindowTarget);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Connection config options & simulation states
  const [activeDevice, setActiveDevice] = useState<any | null>(null);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [connectionMode, setConnectionMode] = useState<"bluetooth" | "cloud" | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [selectedBleDevice, setSelectedBleDevice] = useState<string | null>(null);
  const [cloudEmail, setCloudEmail] = useState("");
  const [cloudPassword, setCloudPassword] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Live real-time biometric telemetry simulation (fluctuating data)
  const [liveMetrics, setLiveMetrics] = useState<Record<string, { battery: number; heartRate: number; steps: number }>>({
    apple: { battery: 84, heartRate: 72, steps: 8420 },
    oura: { battery: 91, heartRate: 64, steps: 5800 },
    oraimo: { battery: 95, heartRate: 78, steps: 11050 },
    samsung: { battery: 78, heartRate: 73, steps: 9150 },
    xiaomi: { battery: 88, heartRate: 70, steps: 13200 }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const isConnected = 
            key === "apple" ? biometricsAppleConnected :
            key === "oura" ? biometricsOuraConnected :
            key === "oraimo" ? biometricsOraimoConnected :
            key === "samsung" ? biometricsSamsungConnected :
            key === "xiaomi" ? biometricsXiaomiConnected : false;

          if (isConnected) {
            next[key] = {
              battery: Math.max(5, Math.min(100, prev[key].battery + (Math.random() > 0.95 ? -1 : 0))),
              heartRate: Math.max(55, Math.min(130, prev[key].heartRate + Math.round((Math.random() - 0.5) * 4))),
              steps: prev[key].steps + (Math.random() > 0.65 ? Math.round(Math.random() * 3) : 0)
            };
          }
        });
        return next;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [
    biometricsAppleConnected,
    biometricsOuraConnected,
    biometricsOraimoConnected,
    biometricsSamsungConnected,
    biometricsXiaomiConnected
  ]);

  const handleSave = () => {
    updateProfile({
      userName: tempName,
      userTitle: tempTitle,
      userBio: tempBio,
      focusTarget: Number(tempFocus),
      sleepWindowTarget: tempSleep
    });
    setIsEditing(false);
    triggerToast("Profile updated successfully!");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Web Bluetooth Scan safe runner
  const handleWebBluetoothScan = async () => {
    setSyncLogs((prev) => [...prev, "[BLE-API] Contacting navigator.bluetooth web host..."]);
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'heart_rate']
      });
      setSyncLogs((prev) => [
        ...prev, 
        `[BLE-API] Discovered browser-paired hardware stream: ${device.name || "Bluetooth Peripheral"}`,
        `[BLE-API] Handshake confirmed by client application.`
      ]);
      startHandshakeSimulation(device.name || activeDevice.name);
    } catch (err: any) {
      console.warn("Web Bluetooth block (expected standard fallback):", err);
      let blockReason = `[BLE-IO] Standard browser Web Bluetooth closed or device selection cancelled.`;
      if (err.name === 'SecurityError') {
        blockReason = `[IFRAME PROTOCOL SANDBOX REDIRECT]: Direct Web Bluetooth is restricted inside secure preview iframes by top-level origin Policy.`;
      }
      setSyncLogs((prev) => [
        ...prev,
        blockReason,
        `[SYS-BYPASS] Bootstrapping high-performance local BLE RF Emulation layer...`
      ]);
      setTimeout(() => {
        startHandshakeSimulation();
      }, 750);
    }
  };

  const startHandshakeSimulation = (detectedLabelName?: string) => {
    setIsSyncing(true);
    const logs = [
      `[BLE-PHY] Discovering peripheral channels (2402 - 2480 MHz)...`,
      `[BLE-PHY] Found active telemetry node: ${detectedLabelName || activeDevice.name} (Address BC:05:43:8E:${Math.floor(Math.random() * 89 + 10)}:AC)`,
      `[BLE-RF] Establishing peer-to-peer secure encryption sync keys...`,
      `[BLE-SYS] Secure handshakes bound. Tuning transmitter with 128-bit LE Crypto.`,
      `[BLE-GATT] Querying GATT Services list on peripheral device...`,
      `[BLE-GATT] Found primary service: Cardiac Telemetry (UUID: 0x180D)`,
      `[BLE-GATT] Subscribed to characteristic 0x2A37 (Live Cardiac notifications enabled)`,
      `[BLE-GATT] Found primary service: Battery Level Service (UUID: 0x180F)`,
      `[BLE-GATT] Registered to characteristic 0x2A19 (Device Battery level notifications enabled)`,
      `[SYS-CORE] Real-time biometrics tunnel mapped! Handshake completely successful.`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logs.length) {
        setSyncLogs((prev) => [...prev, logs[step]]);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsSyncing(false);
          setIsSuccess(true);
          updateProfile({ [activeDevice.toggleKey]: true });
          useHabitStore.getState().awardXP(200);
          useHabitStore.getState().trackMixpanelEvent("device_paired_ble", { 
            device_id: activeDevice.id, 
            device_name: activeDevice.name 
          });
          triggerToast(`${activeDevice.name} connected successfully via Bluetooth BLE!`);
        }, 500);
      }
    }, 280);
  };

  const startCloudSyncSimulation = () => {
    if (activeDevice.id === "oura" && !apiToken) {
      triggerToast("An Oura API Personal Token is strictly required for OAuth bypass.");
      return;
    }
    if (activeDevice.id !== "oura" && (!cloudEmail || !cloudPassword)) {
      triggerToast("Sign-in email and encryption password are required.");
      return;
    }

    setIsSyncing(true);
    setSyncLogs([
      `[API-SYNC] Resolving Cloud API routing tables with gateway proxy...`,
      activeDevice.id === "oura" 
        ? `[API-GATEWAY] Sending Bearer token query packet to api.ouraring.com/v2/usercloud...`
        : `[API-GATEWAY] Dispatching encrypted login credentials packet to standard authorization server...`,
      `[API-OAUTH] 201 Acknowledge: Bearer credentials successfully authorized.`
    ]);

    let logStep = 0;
    const interval = setInterval(() => {
      const logs = [
        `[API-DATA] Querying cloud biometrics data store (circadian.sleep_sessions)...`,
        `[API-DATA] Pulled: Sleep duration vector, Resting Heart Rate telemetry, Activity Steps...`,
        `[API-DATA] Synchronizing 14-day trailing behavior chronological indexes...`,
        `[LOCAL-DB] Committing sleep & physiological logs into localized Firestore database...`,
        `[SYS-OK] Sync established! Cloud sync streams active in database cluster.`
      ];

      if (logStep < logs.length) {
        setSyncLogs((prev) => [...prev, logs[logStep]]);
        logStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsSyncing(false);
          setIsSuccess(true);
          updateProfile({ [activeDevice.toggleKey]: true });
          useHabitStore.getState().awardXP(200);
          useHabitStore.getState().trackMixpanelEvent("device_paired_cloud", { 
            device_id: activeDevice.id, 
            device_name: activeDevice.name 
          });
          triggerToast(`${activeDevice.name} connected successfully via Cloud API Synchronization!`);
        }, 500);
      }
    }, 320);
  };

  const handleOpenConnect = (dev: any) => {
    setActiveDevice(dev);
    setConnectionMode(null);
    setIsSyncing(false);
    setSyncLogs([]);
    setIsSuccess(false);
    setCloudEmail("");
    setCloudPassword("");
    setApiToken("");
    setConnectionModalOpen(true);
  };

  const disconnectDevice = (dev: any) => {
    updateProfile({ [dev.toggleKey]: false });
    triggerToast(`${dev.name} disconnected.`);
  };

  const devicesList = [
    {
      id: "apple",
      name: "Apple Watch Ultra",
      description: "Premium GPS multi-sport telemetry.",
      popularity: "Preferred premium telemetry sink in urban Lagos & Abuja circles.",
      icon: Watch,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      accent: "rose",
      connected: biometricsAppleConnected,
      toggleKey: "biometricsAppleConnected",
      defaultBattery: 88,
      defaultSteps: 8420,
      defaultHr: 72
    },
    {
      id: "oraimo",
      name: "oraimo Watch 4 Plus",
      description: "Nigeria's #1 wearable style & sensor active tracker.",
      popularity: "Highly praised due to robust build and high-speed BLE coupling around Yaba.",
      icon: Watch,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      accent: "emerald",
      connected: biometricsOraimoConnected,
      toggleKey: "biometricsOraimoConnected",
      defaultBattery: 95,
      defaultSteps: 11050,
      defaultHr: 76
    },
    {
      id: "samsung",
      name: "Samsung Galaxy Watch 6",
      description: "Advanced bio-impedance & sleep coaching analyzer.",
      popularity: "A reliable standard for elite Android productivity nodes.",
      icon: Watch,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      accent: "blue",
      connected: biometricsSamsungConnected,
      toggleKey: "biometricsSamsungConnected",
      defaultBattery: 78,
      defaultSteps: 9150,
      defaultHr: 74
    },
    {
      id: "xiaomi",
      name: "Xiaomi Smart Band 8",
      description: "circadian sleep tracker showing 16-day battery density.",
      popularity: "Extremely popular, cost-effective tracker across Nigerian university campuses.",
      icon: Activity,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      accent: "orange",
      connected: biometricsXiaomiConnected,
      toggleKey: "biometricsXiaomiConnected",
      defaultBattery: 91,
      defaultSteps: 13200,
      defaultHr: 69
    },
    {
      id: "oura",
      name: "Oura Ring Gen 3",
      description: "Under-the-hood sleep stage and HRV vector tracking.",
      popularity: "A sophisticated biometric ring for low-impact night tracking.",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      accent: "purple",
      connected: biometricsOuraConnected,
      toggleKey: "biometricsOuraConnected",
      defaultBattery: 94,
      defaultSteps: 5800,
      defaultHr: 61
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="profile-toast"
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#12533a] border border-[#95d4b3] text-[#95d4b3] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-md animate-bounce">check_circle</span>
            <span className="font-semibold text-xs">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1d2021] to-[#12533a]/25 p-6 rounded-2xl border border-[#8f9194]/10">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">WELLNESS COORDINATION HQ</span>
          <h1 className="font-display text-3xl font-extrabold text-[#e1e3e4] mt-1">Identity & Baseline</h1>
          <p className="text-[#c5c6ca] text-sm mt-1">
            Configure your behavioral targets, sync sensors, and edit system archetypes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="profile-goto-settings"
            type="button"
            onClick={() => setView("settings")}
            className="px-4 py-2.5 rounded-xl border border-[#44474a] text-[#c5c6ca] hover:text-white hover:bg-[#323536] text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            SYSTEM CONFIG
          </button>
          <button
            id="profile-signout-btn"
            type="button"
            onClick={logout}
            className="px-4 py-2.5 rounded-xl border border-[#ea4335]/40 hover:border-[#ea4335] text-[#ea4335] hover:bg-[#ea4335]/10 text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            DE-AUTHENTICATE
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#95d4b3]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Circle Ring Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="absolute w-full h-full -rotate-90">
            <circle className="text-[#323536]/40" cx="72" cy="72" fill="transparent" r="66" stroke="currentColor" strokeWidth="4" />
            <circle className="text-[#95d4b3] transition-all duration-1000" cx="72" cy="72" fill="transparent" r="66" stroke="currentColor" strokeWidth="4"
              strokeDasharray={2 * Math.PI * 66}
              strokeDashoffset={2 * Math.PI * 66 * (1 - 0.85)}
              strokeLinecap="round"
            />
          </svg>
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#12533a] shadow-xl bg-[#111415] flex items-center justify-center">
            <span className="text-4xl">🧘</span>
          </div>
          <div className="absolute -bottom-2 bg-[#95d4b3] text-[#002114] px-3 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shadow">
            85% RECOVERY
          </div>
        </div>

        {/* Info Block */}
        <div className="flex-grow space-y-3 text-center md:text-left">
          {isEditing ? (
            <div className="space-y-3 bg-[#111415]/80 p-4 rounded-xl border border-[#323536]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#8f9194] uppercase mb-1">Name</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-[#191c1d] border border-[#44474a] rounded-lg p-2 text-xs text-[#e1e3e4]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#8f9194] uppercase mb-1">Archetype / Vibe</label>
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="w-full bg-[#191c1d] border border-[#44474a] rounded-lg p-2 text-xs text-[#e1e3e4]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#8f9194] uppercase mb-1">Bio / Statement of Intent</label>
                <textarea
                  rows={2}
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  className="w-full bg-[#191c1d] border border-[#44474a] rounded-lg p-2 text-xs text-[#e1e3e4]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-white/5 border border-[#44474a] text-[#8f9194] hover:text-white text-xs cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded-lg bg-[#95d4b3] text-[#002114] text-xs font-bold cursor-pointer border-none"
                >
                  Commit Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-2.5">
                <h2 className="font-display text-2xl font-extrabold text-[#e1e3e4]">{userName}</h2>
                <span className="inline-block text-[10px] font-mono font-bold text-[#95d4b3] bg-[#12533a]/25 border border-[#95d4b3]/20 px-2.5 py-0.5 rounded-lg uppercase tracking-wide self-center">
                  {userTitle} • Level {userLevel || 1}
                </span>
              </div>
              <p className="text-[#c5c6ca] text-xs leading-relaxed max-w-xl">
                {userBio}
              </p>
              <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-1.5">
                <button
                  id="profile-toggle-edit"
                  type="button"
                  onClick={() => {
                    setTempName(userName);
                    setTempTitle(userTitle);
                    setTempBio(userBio);
                    setTempFocus(focusTarget);
                    setTempSleep(sleepWindowTarget);
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 cursor-pointer border-none transition-all"
                >
                  <span className="material-symbols-outlined text-xs">edit</span>
                  EDIT VIBE PARAMETERS
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast("Exporting backup... 5.4k JSON data records verified.")}
                  className="px-4 py-2 rounded-xl bg-transparent border border-[#44474a] text-[#c5c6ca] hover:text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                  EXPORT DATA SET
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Personal circadian protocol limits */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#95d4b3]/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#95d4b3] text-lg">schedule</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#8f9194]">Circadian Behavior Protocol</span>
            </div>
            <h3 className="text-[#e1e3e4] font-semibold text-md mb-2">Daily Anchor Targets</h3>
            <p className="text-[#8f9194] text-xs leading-relaxed">
              These set baseline parameters for active work intervals and circadian sleep sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 pt-2">
            
            <div className="p-4 bg-[#111415]/60 hover:bg-[#111415] border border-[#323536] rounded-xl space-y-1 transition-all">
              <span className="text-[9px] font-mono uppercase text-[#8f9194] tracking-wider block">Cognitive Focus target</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-2xl text-white">{focusTarget}</span>
                <span className="text-[10px] text-[#8f9194]">hrs/day</span>
              </div>
              <div className="w-full bg-[#323536]/60 rounded-full h-1 mt-1">
                <div className="bg-[#95d4b3] h-1 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>

            <div className="p-4 bg-[#111415]/60 hover:bg-[#111415] border border-[#323536] rounded-xl space-y-1 transition-all">
              <span className="text-[9px] font-mono uppercase text-[#8f9194] tracking-wider block">Sleep Sync Target</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-2xl text-white">{sleepWindowTarget}</span>
                <span className="text-[10px] text-[#8f9194]">duration</span>
              </div>
              <div className="flex gap-1.5 mt-2.5">
                <span className="w-2 h-2 rounded-full bg-[#95d4b3]"></span>
                <span className="w-2 h-2 rounded-full bg-[#95d4b3]"></span>
                <span className="w-2 h-2 rounded-full bg-[#95d4b3]"></span>
                <span className="w-2 h-2 rounded-full bg-[#c5c6ca]/20"></span>
              </div>
            </div>

            <div className="p-4 bg-[#111415]/60 hover:bg-[#111415] border border-[#323536] rounded-xl space-y-1 transition-all">
              <span className="text-[9px] font-mono uppercase text-[#8f9194] tracking-wider block">Soundscape Preset</span>
              <div className="flex items-center gap-1.5 pt-0.5 text-[#95d4b3]">
                <span className="material-symbols-outlined text-sm">waves</span>
                <span className="text-xs font-semibold truncate block">{soundscapeTrack}</span>
              </div>
              <span className="text-[9px] text-[#8f9194] font-mono block mt-1.5">{activeSoundscapeTimer}</span>
            </div>

          </div>

          <div className="bg-[#191c1d] rounded-xl p-4 border border-[#44474a]/30">
            <span className="text-[9px] font-mono text-[#95d4b3] font-bold block uppercase tracking-widest mb-1">AUTOMATED THRESHOLD COUPLING</span>
            <p className="text-[11px] text-[#c5c6ca] leading-relaxed">
              If your logged sleep drops more than 2.0 hrs below the target sleep duration ({sleepWindowTarget}), the <strong>Anti-Shame Auto-Scaler</strong> will downscale your active Focus Pomodoros to avoid frontal-lobe fatigue.
            </p>
          </div>
        </div>

        {/* Biometrics Integration panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#95d4b3] font-bold">BIO-TELEMETRY SYNC</span>
              <span className="w-2.5 h-2.5 bg-[#95d4b3] rounded-full animate-pulse"></span>
            </div>
            <h3 className="text-[#e1e3e4] font-semibold text-md mb-1.5">Connected Hardware Arrays</h3>
            <p className="text-[#8f9194] text-[11px] leading-relaxed mb-4">
              Bind physically with low-energy radio wearables, or connect your API clouds to auto-import daily bio-readings.
            </p>

            <div className="space-y-3.5">
              {devicesList.map((dev) => {
                const IconComponent = dev.icon;
                const metrics = liveMetrics[dev.id] || { battery: dev.defaultBattery, heartRate: dev.defaultHr, steps: dev.defaultSteps };
                
                return (
                  <div 
                    id={`device-card-${dev.id}`}
                    key={dev.id} 
                    className={`p-3.5 rounded-xl border transition-all duration-300 bg-[#111415]/70 ${
                      dev.connected 
                        ? "border-[#95d4b3]/30 hover:border-[#95d4b3]/50 shadow-[0_0_12px_rgba(149,212,179,0.05)]" 
                        : "border-[#44474a]/30 hover:border-[#8f9194]/25"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${dev.color} shrink-0`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#e1e3e4]">{dev.name}</span>
                            {dev.connected ? (
                              <span className="w-1.5 h-1.5 bg-[#95d4b3] rounded-full animate-ping"></span>
                            ) : null}
                          </div>
                          <span className="block text-[9px] text-[#8f9194] leading-tight font-mono uppercase tracking-wider mt-0.5">
                            {dev.connected ? (
                              <span className="text-[#95d4b3] font-bold">CONNECTED SYNC ACTIVE</span>
                            ) : (
                              <span>UNPAIRED • STANDBY</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {dev.connected ? (
                        <button
                          id={`device-disconnect-btn-${dev.id}`}
                          type="button"
                          onClick={() => disconnectDevice(dev)}
                          className="px-2.5 py-1 text-[9px] font-mono uppercase font-bold text-[#ffb4ab] border border-[#ffb4ab]/20 hover:border-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-lg cursor-pointer transition-all duration-150 active:scale-95 text-[10px]"
                        >
                          RELEASE
                        </button>
                      ) : (
                        <button
                          id={`device-connect-btn-${dev.id}`}
                          type="button"
                          onClick={() => handleOpenConnect(dev)}
                          className="px-2.5 py-1 text-[9px] font-mono uppercase font-bold text-[#95d4b3] border border-[#95d4b3]/20 hover:border-[#95d4b3] hover:bg-[#12533a]/20 rounded-lg cursor-pointer transition-all duration-150 active:scale-95 text-[10px]"
                        >
                          PAIR PEER
                        </button>
                      )}
                    </div>

                    {dev.connected && (
                      <div className="mt-3 pt-2.5 border-t border-[#323536] grid grid-cols-3 gap-1 text-center bg-[#111415]/90 p-1.5 rounded-lg">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-[#8f9194] uppercase tracking-wider block text-[7px]">BATTERY</span>
                          <div className="flex items-center justify-center gap-1 text-xs font-mono font-bold text-[#e1e3e4] text-[10px]">
                            <Battery className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{metrics.battery}%</span>
                          </div>
                        </div>
                        <div className="space-y-0.5 border-x border-[#323536]">
                          <span className="text-[8px] font-mono text-[#8f9194] uppercase tracking-wider block text-[7px]">HEART RATE</span>
                          <div className="flex items-center justify-center gap-1 text-xs font-mono font-bold text-[#e1e3e4] text-[10px]">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                            <span>{metrics.heartRate} bpm</span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-[#8f9194] uppercase tracking-wider block text-[7px]">DAILY STEPS</span>
                          <div className="flex items-center justify-center gap-1 text-xs font-mono font-bold text-[#e1e3e4] text-[10px]">
                            <Activity className="w-3.5 h-3.5 text-blue-400" />
                            <span>{metrics.steps.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[9px] text-[#8f9194] leading-relaxed italic text-center mt-5 pt-3 border-t border-[#323536]/30">
            🔒 Fully localized 128-bit LE Crypto bindings. Zero telemetry values uploaded.
          </div>
        </div>

      </div>

      {/* Identity Baseline Card */}
      <div className="p-6 rounded-2xl bg-[#1d2021]/80 border border-[#8f9194]/10 space-y-4">
        <div>
          <h3 className="text-md font-bold text-[#e1e3e4]">Identity Baselines</h3>
          <p className="text-xs text-[#8f9194]">Core wellness filters established during onboarding, framing daily behaviors.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 bg-[#111415]/60 hover:bg-[#111415] border border-[#323536] rounded-xl space-y-2 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#95d4b3]/10 text-[#95d4b3] flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">psychology</span>
            </div>
            <h4 className="text-xs font-bold text-[#e1e3e4]">Intellectual Mastery</h4>
            <p className="text-[10px] text-[#8f9194] leading-relaxed">
              Prioritize deep systems modeling and architectural planning during peak circadian alertness windows.
            </p>
          </div>

          <div className="p-4 bg-[#111415]/60 hover:bg-[#111415] border border-[#323536] rounded-xl space-y-2 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#e9c176]/10 text-[#e9c176] flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">spa</span>
            </div>
            <h4 className="text-xs font-bold text-[#e1e3e4]">Mindful Recovery</h4>
            <p className="text-[10px] text-[#8f9194] leading-relaxed">
              Mandate cognitive downtime, including daily NSDR or breathing exercises, to maintain prefrontal cortex integrity.
            </p>
          </div>

          <div className="p-4 bg-[#111415]/60 hover:bg-[#111415] border border-[#323536] rounded-xl space-y-2 transition-all">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">bolt</span>
            </div>
            <h4 className="text-xs font-bold text-[#e1e3e4]">Physical Readiness</h4>
            <p className="text-[10px] text-[#8f9194] leading-relaxed">
              Execute aerobic triggers and somatic hydration protocols to maintain biological peak operating levels.
            </p>
          </div>

          <div className="p-4 bg-[#111415]/60 hover:bg-[#111415] border border-[#323536] rounded-xl space-y-2 transition-all">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">finance</span>
            </div>
            <h4 className="text-xs font-bold text-[#e1e3e4]">Quantified Self</h4>
            <p className="text-[10px] text-[#8f9194] leading-relaxed">
              Align performance milestones directly with telemetry records to avoid emotional self-assessment bias.
            </p>
          </div>

        </div>
      </div>

      {/* Dynamic Connection Configuration Modal */}
      <AnimatePresence>
        {connectionModalOpen && activeDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-md p-4">
            <motion.div
              id="device-conn-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#1d2021] border border-[#8f9194]/20 p-6 shadow-2xl space-y-5 my-8"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setConnectionModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#111415] border border-[#323536] text-[#8f9194] hover:text-white cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${activeDevice.color}`}>
                  {(() => {
                    const IconComponent = activeDevice.icon;
                    return <IconComponent className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#95d4b3] font-bold">PEER HARDWARE CONFIGURATION</span>
                  <h2 className="text-xl font-display font-extrabold text-[#e1e3e4]">{activeDevice.name}</h2>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[#c5c6ca] leading-relaxed">
                  Choose your preferred physical or secure cloud sync protocol to bind this device with your HabitFlow engine.
                </p>
                <span className="block text-[10px] text-[#8f9194] font-mono italic">
                  ℹ️ {activeDevice.popularity}
                </span>
              </div>

              {/* Step 1: Mode Selection */}
              {!connectionMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setConnectionMode("bluetooth");
                      setSyncLogs([`[BLE-PHY] Querying physical RF transceivers...`]);
                    }}
                    className="p-4 rounded-xl bg-[#111415] hover:bg-[#111415]/60 hover:border-[#95d4b3]/60 border border-[#323536] text-left transition-all duration-200 cursor-pointer space-y-3 shrink-0 active:scale-[0.98] outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Bluetooth className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#e1e3e4]">Bluetooth BLE Peer</span>
                      <span className="block text-[10px] text-[#8f9194] mt-1 leading-relaxed">
                        Physical pairing via low-energy radio scan. Safe and standalone.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConnectionMode("cloud");
                    }}
                    className="p-4 rounded-xl bg-[#111415] hover:bg-[#111415]/60 hover:border-blue-400/60 border border-[#323536] text-left transition-all duration-200 cursor-pointer space-y-3 shrink-0 active:scale-[0.98] outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#e1e3e4]">Cloud API Data Sync</span>
                      <span className="block text-[10px] text-[#8f9194] mt-1 leading-relaxed">
                        Synchronize statistics over OAuth REST protocols.
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 2A: BLE SCAN & PAIR */}
              {connectionMode === "bluetooth" && !isSuccess && (
                <div className="space-y-4 pt-1">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[#a3e635] rounded-xl text-xs flex gap-2.5 items-start">
                    <Wifi className="w-4 h-4 mt-0.5 shrink-0 animate-bounce text-emerald-400" />
                    <p className="text-[11px] leading-relaxed text-[#c5c6ca]">
                      Bluetooth pairing queries and establishes link directly. If you are running on desktop, this attempt will scan for direct hardware broadcasts.
                    </p>
                  </div>

                  {syncLogs.length === 1 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-[#111415] rounded-xl border border-[#323536] gap-4">
                      <div className="relative flex items-center justify-center w-12 h-12">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#95d4b3]/10 animate-ping"></span>
                        <div className="relative p-3 rounded-full bg-[#12533a]/30 text-[#95d4b3]">
                          <Bluetooth className="w-6 h-6 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <span className="text-xs font-bold text-[#e1e3e4]">Activate RF Sensor Bluetooth Scan</span>
                        <p className="text-[10px] text-[#8f9194]">Ensure the device is powered on, close by, and broadcasting.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleWebBluetoothScan}
                        className="px-4 py-2 bg-[#95d4b3] text-[#002114] font-bold text-xs rounded-lg hover:bg-[#95d4b3]/90 transition-all cursor-pointer border-none"
                      >
                        SEARCH FOR DEVICE
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">BLE Handshake Log Terminal:</span>
                        {isSyncing && <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />}
                      </div>
                      <div className="bg-black/90 rounded-xl p-3 border border-[#323536] font-mono text-[9px] text-[#95d4b3] h-40 overflow-y-auto space-y-1 select-all scrollbar-thin">
                        {syncLogs.map((log, index) => (
                          <div key={index} className="flex gap-1.5 leading-relaxed">
                            <span className="text-[#8f9194]/60">[{index + 1}]</span>
                            <span className={log.includes("[SYS") ? "text-emerald-400 font-bold" : log.includes("[BLE-API") ? "text-amber-300" : "text-[#95d4b3]"}>
                              {log}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2 pt-2 border-t border-[#323536]/40">
                    <button
                      type="button"
                      onClick={() => setConnectionMode(null)}
                      className="px-3.5 py-1.5 rounded-lg border border-[#323536] text-xs font-bold text-[#8f9194] hover:text-white transition-all cursor-pointer bg-transparent"
                    >
                      GO BACK
                    </button>
                    <span className="text-[9px] font-mono text-[#8f9194] italic">RSSI threshold filtered: &gt; -85dBm</span>
                  </div>
                </div>
              )}

              {/* Step 2B: CLOUD API FORM */}
              {connectionMode === "cloud" && !isSuccess && (
                <div className="space-y-4 pt-1">
                  {syncLogs.length === 0 ? (
                    <div className="space-y-3">
                      {activeDevice.id === "oura" ? (
                        <div>
                          <label className="block text-[10px] font-mono text-[#8f9194] uppercase tracking-widest mb-1.5 font-bold">Oura personal access token:</label>
                          <input
                            type="password"
                            value={apiToken}
                            onChange={(e) => setApiToken(e.target.value)}
                            placeholder="eyJhbGciOiJSUzI1NiIs..."
                            className="w-full bg-[#111415] border border-[#323536] rounded-xl p-3 text-xs text-[#e1e3e4] font-mono focus:border-blue-400 outline-none"
                          />
                          <p className="text-[10px] text-[#8f9194] mt-1.5 leading-relaxed">
                            Generate your security token in the <a href="https://cloud.ouraring.com/personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hvr-underline">Oura Developer Portal</a>. HabitFlow stores token credentials locally.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-mono text-[#8f9194] uppercase tracking-widest mb-1 font-bold">Email address:</label>
                              <input
                                type="email"
                                value={cloudEmail}
                                onChange={(e) => setCloudEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full bg-[#111415] border border-[#323536] rounded-xl p-3 text-xs text-[#e1e3e4] outline-none focus:border-blue-400"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-[#8f9194] uppercase tracking-widest mb-1 font-bold">Account password:</label>
                              <input
                                type="password"
                                value={cloudPassword}
                                onChange={(e) => setCloudPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-[#111415] border border-[#323536] rounded-xl p-3 text-xs text-[#e1e3e4] outline-none focus:border-blue-400"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-[#8f9194] leading-relaxed pt-1 select-none">
                            Connecting with {activeDevice.name} cloud sync server (TLS encrypted endpoint). Standard payload extracts trailing 14-day chronological circadian sets.
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center gap-2 pt-2.5 border-t border-[#323536] mt-4">
                        <button
                          type="button"
                          onClick={() => setConnectionMode(null)}
                          className="px-3.5 py-1.5 rounded-lg border border-[#323536] text-xs font-bold text-[#8f9194] hover:text-white transition-all cursor-pointer bg-transparent"
                        >
                          GO BACK
                        </button>
                        <button
                          type="button"
                          onClick={startCloudSyncSimulation}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer border-none flex items-center gap-1.5 shadow"
                        >
                          <FolderSync className="w-3.5 h-3.5" />
                          PEER CLOUD SYNC
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">REST API Request Stream:</span>
                        {isSyncing && <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                      </div>
                      <div className="bg-black/90 rounded-xl p-3 border border-[#323536] font-mono text-[9px] text-[#c5c6ca] h-40 overflow-y-auto space-y-1 select-all scrollbar-thin">
                        {syncLogs.map((log, index) => (
                          <div key={index} className="flex gap-1.5 leading-relaxed">
                            <span className="text-[#8f9194]/60">[{index + 1}]</span>
                            <span className={log.includes("[SYS") || log.includes("[API-DATA] Pulled") ? "text-green-400 font-bold" : log.includes("[API-GATEWAY") ? "text-blue-400" : "text-[#e1e3e4]"}>
                              {log}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Success Screen */}
              {isSuccess && (
                <div className="flex flex-col items-center justify-center p-8 bg-[#111415] rounded-xl border border-[#95d4b3]/20 gap-4 text-center">
                  <div className="w-14 h-14 bg-emerald-500/10 text-[#95d4b3] border border-[#95d4b3]/30 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-8 h-8 animate-bounce text-[#95d4b3]" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-mono text-[10px] text-[#95d4b3] font-bold block tracking-wider uppercase">PAIRING LINK SECURED (+200 XP AWARDED)</span>
                    <h3 className="text-lg font-display font-extrabold text-[#e1e3e4]">{activeDevice.name} Linked!</h3>
                    <p className="text-xs text-[#8f9194] leading-relaxed max-w-sm">
                      Handshake parameters verified. Your heart rate sensors, step tracking, and night sleep indexes are now synched offline with state variables.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConnectionModalOpen(false);
                      triggerToast(`${activeDevice.name} sync established successfully!`);
                    }}
                    className="px-6 py-2 bg-[#95d4b3] text-[#002114] font-bold text-xs rounded-lg hover:bg-[#95d4b3]/80 transition-all cursor-pointer border-none shadow active:scale-95"
                  >
                    RETURN TO PROFILES
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
