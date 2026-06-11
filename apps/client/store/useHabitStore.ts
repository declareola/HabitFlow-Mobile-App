import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Habit, MetricLog, FocusSession, Milestone, LeaderboardUser, AIChatMessage } from "../types";
import { 
  initialHabits, 
  initialMetrics, 
  initialMilestones, 
  initialLeaderboard 
} from "../../../src/preconstructedData";

export interface MixpanelEvent {
  id: string;
  event: string;
  timestamp: string;
  payload: any;
}

interface HabitFlowState {
  currentView: string;
  weeklyFocus: string;
  sleepScore: number;
  userXP: number;
  userLevel: number;
  habits: Habit[];
  metrics: MetricLog[];
  focusHistory: FocusSession[];
  milestones: Milestone[];
  leaderboard: LeaderboardUser[];
  
  // New States for PRD & Compliance
  timezone: string;
  mixpanelEvents: MixpanelEvent[];
  onboardingGoal: string | null;
  onboardingSleepHours: number;
  showTimezoneAlert: boolean;
  showBurnoutRecoveryNotice: boolean;
  showMentalHealthEscalation: boolean;
  activeAIInsight: { message: string; actionable: string; type: "burnout" | "optimization" } | null;
  activeAIChat: AIChatMessage[];

  // Profile Specific State
  userName: string;
  userTitle: string;
  userBio: string;
  focusTarget: number;
  sleepWindowTarget: string;
  soundscapeTrack: string;
  activeSoundscapeTimer: string;
  biometricsAppleConnected: boolean;
  biometricsOuraConnected: boolean;
  biometricsOraimoConnected: boolean;
  biometricsSamsungConnected: boolean;
  biometricsXiaomiConnected: boolean;

  // Settings Specific State
  strictBlockMode: boolean;
  autoFocusDetection: boolean;
  soundscapeVolume: number;
  coachSensitivity: number; // 0-100 scale
  recoveryAlerts: boolean;
  habitReminders: boolean;
  weeklyBriefings: boolean;
  appTheme: "ambient-green" | "deep-indigo" | "cyber-orange";
  syncToSystemTheme: boolean;

  // Actions
  setView: (view: string) => void;
  setWeeklyFocus: (focus: string) => void;
  setSleepScore: (score: number) => void;
  awardXP: (amount: number) => void;
  completeOnboarding: (score: number, focus: string, goal: string, sleepHrs: number) => void;
  toggleHabit: (id: string) => void;
  addHabit: (newHabit: Omit<Habit, "id" | "streakCount" | "lastDone">) => void;
  deleteHabit: (id: string) => void;
  scaleDownHabit: (id: string, step1: string, step2: string, step3: string) => void;
  addGratitude: (text: string) => void;
  logWellness: (newLog: Omit<MetricLog, "id" | "date">) => void;
  addFocusSession: (session: Omit<FocusSession, "id" | "date">) => void;
  updateMilestoneProgress: (milestoneId: string, increment: number) => void;
  
  // New Actions
  trackMixpanelEvent: (event: string, payload: any) => void;
  triggerTimezoneTravel: (targetZone: string) => void;
  dismissTimezoneAlert: () => void;
  executeHardDelete: () => void;
  sendCoachMessage: (text: string) => void;

  updateProfile: (profile: Partial<{
    userName: string;
    userTitle: string;
    userBio: string;
    focusTarget: number;
    sleepWindowTarget: string;
    soundscapeTrack: string;
    activeSoundscapeTimer: string;
    biometricsAppleConnected: boolean;
    biometricsOuraConnected: boolean;
    biometricsOraimoConnected: boolean;
    biometricsSamsungConnected: boolean;
    biometricsXiaomiConnected: boolean;
  }>) => void;

  updateSettings: (settings: Partial<{
    strictBlockMode: boolean;
    autoFocusDetection: boolean;
    soundscapeVolume: number;
    coachSensitivity: number;
    recoveryAlerts: boolean;
    habitReminders: boolean;
    weeklyBriefings: boolean;
    appTheme: "ambient-green" | "deep-indigo" | "cyber-orange";
    syncToSystemTheme: boolean;
  }>) => void;
}

const XP_TARGET = 5000;
const getUid = () => auth.currentUser?.uid;

export const useHabitStore = create<HabitFlowState>()(
  persist(
    (set, get) => ({
  currentView: "welcome",
  weeklyFocus: "",
  sleepScore: 0,
  userXP: 0,
  userLevel: 1,
  habits: initialHabits,
  metrics: initialMetrics,
  focusHistory: [],
  milestones: initialMilestones,
  leaderboard: initialLeaderboard,

  // Initializing new states dynamically
  timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Africa/Lagos",

  // Profile defaults - fresh slate
  userName: "New User",
  userTitle: "Novice",
  userBio: "",
  focusTarget: 6.0,
  sleepWindowTarget: "08:00",
  soundscapeTrack: "Brown Noise (Deep)",
  activeSoundscapeTimer: "No session active",
  biometricsAppleConnected: false,
  biometricsOuraConnected: false,
  biometricsOraimoConnected: false,
  biometricsSamsungConnected: false,
  biometricsXiaomiConnected: false,

  // Settings defaults
  strictBlockMode: false,
  autoFocusDetection: false,
  soundscapeVolume: 50,
  coachSensitivity: 50,
  recoveryAlerts: true,
  habitReminders: true,
  weeklyBriefings: false,
  appTheme: "ambient-green",
  syncToSystemTheme: false,
  mixpanelEvents: [],
  onboardingGoal: null,
  onboardingSleepHours: 8.0,
  showTimezoneAlert: false,
  showBurnoutRecoveryNotice: false,
  showMentalHealthEscalation: false,
  activeAIInsight: null,
  activeAIChat: [
    {
      id: "msg_welcome",
      role: "model",
      content: "Welcome to HabitFlow AI. Log your first biomarkers or configure a daily focus routine to activate the biological coach.",
      timestamp: new Date().toISOString()
    }
  ],

  setView: (view) => set({ currentView: view }),
  setWeeklyFocus: (focus) => {
    set({ weeklyFocus: focus });
    const uid = getUid();
    if (uid) {
      updateDoc(doc(db, "users", uid), { weeklyFocus: focus }).catch(err => console.error(err));
    }
  },
  setSleepScore: (score) => {
    set({ sleepScore: score });
    const uid = getUid();
    if (uid) {
      updateDoc(doc(db, "users", uid), { sleepScore: score }).catch(err => console.error(err));
    }
  },

  awardXP: (amount) => {
    set((state) => {
      const updatedXP = state.userXP + amount;
      let targetXP = updatedXP;
      let targetLevel = state.userLevel;

      if (updatedXP >= XP_TARGET) {
        targetXP = updatedXP - XP_TARGET;
        targetLevel = state.userLevel + 1;
      }

      const updatedLeaderboard = state.leaderboard.map((user) => 
        user.isSelf ? { ...user, level: targetLevel, xp: targetXP } : user
      );

      const uid = getUid();
      if (uid) {
        updateDoc(doc(db, "users", uid), {
          userXP: targetXP,
          userLevel: targetLevel
        }).catch(err => console.error("Error setting XP in Firestore: ", err));
      }

      return {
        userXP: targetXP,
        userLevel: targetLevel,
        leaderboard: updatedLeaderboard
      };
    });
  },

  completeOnboarding: (score, focus, goal, sleepHrs) => {
    const today = new Date().toISOString().split("T")[0];
    const initialLog: MetricLog = {
      id: "log_onboarding",
      date: today,
      sleepScore: score,
      sleepHours: sleepHrs,
      waterIntake: 2.0,
      mindState: "Focus"
    };

    set((state) => ({
      sleepScore: score,
      weeklyFocus: focus,
      onboardingGoal: goal,
      onboardingSleepHours: sleepHrs,
      metrics: [...state.metrics, initialLog],
      currentView: "dashboard"
    }));

    const uid = getUid();
    if (uid) {
      updateDoc(doc(db, "users", uid), {
        sleepScore: score,
        weeklyFocus: focus,
        onboardingGoal: goal,
        onboardingSleepHours: sleepHrs
      }).catch(err => console.error(err));

      setDoc(doc(db, "users", uid, "metrics", initialLog.id), initialLog).catch(err => console.error(err));
    }

    get().awardXP(150);
    get().trackMixpanelEvent("onboarding_completed", { selected_focus: focus, primary_goal: goal, base_sleep_hrs: sleepHrs });
  },

  toggleHabit: (id) => {
    const today = new Date().toISOString().split("T")[0];
    let isWellnessAndFirstTime = false;
    let targetHabit: Habit | null = null;

    set((state) => {
      const updatedHabits = state.habits.map((h) => {
        if (h.id === id) {
          const isDone = h.lastDone === today;
          const updatedLastDone = isDone ? null : today;
          const updatedStreak = isDone ? Math.max(0, h.streakCount - 1) : h.streakCount + 1;
          
          if (!isDone) {
            get().awardXP(100);
            get().trackMixpanelEvent("habit_completed", {
              habit_category: h.category,
              habit_title: h.title,
              time_of_day: new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening",
              streak_count: updatedStreak,
              on_time: true
            });
            if (h.category === "wellness") {
              isWellnessAndFirstTime = true;
            }
          }
          const nextH: Habit = {
            ...h,
            lastDone: updatedLastDone,
            streakCount: updatedStreak
          };
          targetHabit = nextH;
          return nextH;
        }
        return h;
      });
      return { habits: updatedHabits };
    });

    const uid = getUid();
    if (uid && targetHabit) {
      setDoc(doc(db, "users", uid, "habits", id), targetHabit).catch(err => console.error(err));
    }

    if (isWellnessAndFirstTime) {
      get().updateMilestoneProgress("ms2", 1);
    }
  },

  addHabit: (newHabitData) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `h_${Date.now()}`,
      streakCount: 0,
      lastDone: null
    };

    set((state) => ({
      habits: [...state.habits, newHabit]
    }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, "users", uid, "habits", newHabit.id), newHabit).catch(err => console.error(err));
    }

    get().awardXP(250);
    get().updateMilestoneProgress("ms4", 1);
    get().trackMixpanelEvent("habit_created", { title: newHabitData.title, category: newHabitData.category });
  },

  deleteHabit: (id) => {
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id)
    }));

    const uid = getUid();
    if (uid) {
      deleteDoc(doc(db, "users", uid, "habits", id)).catch(err => console.error(err));
    }

    get().trackMixpanelEvent("habit_deleted", { id });
  },

  scaleDownHabit: (id, step1, step2, step3) => {
    const today = new Date().toISOString().split("T")[0];
    let targetHabit: Habit | null = null;

    set((state) => {
      const updatedHabits = state.habits.map((h) => {
        if (h.id === id) {
          const nextH = {
            ...h,
            step1,
            step2,
            step3,
            streakCount: Math.max(1, h.streakCount + 1),
            lastDone: today
          };
          targetHabit = nextH;
          return nextH;
        }
        return h;
      });
      return { habits: updatedHabits };
    });

    const uid = getUid();
    if (uid && targetHabit) {
      setDoc(doc(db, "users", uid, "habits", id), targetHabit).catch(err => console.error(err));
    }

    get().awardXP(200);
    get().trackMixpanelEvent("habit_micro_scaled", { id, micro_anchors: { step1, step2, step3 } });
  },

  addGratitude: (text) => {
    let targetLog: MetricLog | null = null;
    set((state) => {
      if (state.metrics.length === 0) return {};
      const updatedMetrics = [...state.metrics];
      const latest = { ...updatedMetrics[updatedMetrics.length - 1] };
      latest.gratitudeText = text;
      updatedMetrics[updatedMetrics.length - 1] = latest;
      targetLog = latest;
      return { metrics: updatedMetrics };
    });

    const uid = getUid();
    if (uid && targetLog) {
      setDoc(doc(db, "users", uid, "metrics", (targetLog as MetricLog).id), targetLog).catch(err => console.error(err));
    }

    get().awardXP(150);
    get().trackMixpanelEvent("gratitude_logged", { length: text.length });
  },

  logWellness: (newLogData) => {
    const today = new Date().toISOString().split("T")[0];
    const newLog: MetricLog = {
      ...newLogData,
      id: `log_${Date.now()}`,
      date: today
    };

    const triggersBurnout = newLogData.sleepScore < 60 || newLogData.sleepHours < 5.5;
    const lowerGratitude = (newLogData.gratitudeText || "").toLowerCase();
    const hasMentalHealthRisk = lowerGratitude.includes("hopeless") || 
                                lowerGratitude.includes("depressed") || 
                                lowerGratitude.includes("can't go on") ||
                                lowerGratitude.includes("cant go on") ||
                                lowerGratitude.includes("suicide") ||
                                lowerGratitude.includes("worthless");

    set((state) => ({
      metrics: [...state.metrics, newLog],
      sleepScore: newLogData.sleepScore,
      showBurnoutRecoveryNotice: triggersBurnout ? true : state.showBurnoutRecoveryNotice,
      showMentalHealthEscalation: hasMentalHealthRisk ? true : state.showMentalHealthEscalation,
      activeAIInsight: triggersBurnout ? {
        message: "SYSTEM ALARM: Neuro-Circadian Burnout detected. Your rest cycle duration has dropped below critical threshold.",
        actionable: "Slowing down active flow stacks. Postpone high-intensity deep work blocks and perform sunlight Walks only.",
        type: "burnout"
      } : state.activeAIInsight
    }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, "users", uid, "metrics", newLog.id), newLog).catch(err => console.error(err));
      updateDoc(doc(db, "users", uid), { sleepScore: newLogData.sleepScore }).catch(err => console.error(err));
    }

    get().awardXP(300);
    
    get().trackMixpanelEvent("wellness_biomarkers_logged", {
      sleep_score: newLogData.sleepScore,
      sleep_hours: newLogData.sleepHours,
      water_intake: newLogData.waterIntake,
      mind_state: newLogData.mindState,
      triggers_burnout: triggersBurnout,
      suicide_escalation: hasMentalHealthRisk
    });

    if (newLogData.sleepScore >= 80) {
      get().updateMilestoneProgress("ms3", 1);
    }
  },

  addFocusSession: (sessionData) => {
    const today = new Date().toISOString().split("T")[0];
    const newSession: FocusSession = {
      ...sessionData,
      id: `session_${Date.now()}`,
      date: today
    };

    set((state) => ({
      focusHistory: [...state.focusHistory, newSession]
    }));

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, "users", uid, "focusHistory", newSession.id), newSession).catch(err => console.error(err));
    }

    get().awardXP(850);
    get().updateMilestoneProgress("ms1", 1);
    
    get().trackMixpanelEvent("focus_session_ended", {
      session_type: "deep_work",
      planned_duration_m: sessionData.durationMinutes,
      actual_duration_m: sessionData.durationMinutes,
      completion_rate: 100,
      interruptions: 0
    });
  },

  updateMilestoneProgress: (milestoneId, increment) => {
    const today = new Date().toISOString().split("T")[0];
    let targetMilestone: Milestone | null = null;

    set((state) => {
      const updatedMilestones = state.milestones.map((ms) => {
        if (ms.id === milestoneId) {
          const updatedCount = Math.min(ms.targetCount, ms.currentCount + increment);
          const isUnlockedNow = updatedCount >= ms.targetCount && ms.unlockedAt === null;
          const nextM = {
            ...ms,
            currentCount: updatedCount,
            unlockedAt: isUnlockedNow ? today : ms.unlockedAt
          };
          targetMilestone = nextM;
          return nextM;
        }
        return ms;
      });
      return { milestones: updatedMilestones };
    });

    const uid = getUid();
    if (uid && targetMilestone) {
      setDoc(doc(db, "users", uid, "milestones", milestoneId), targetMilestone).catch(err => console.error(err));
    }
  },

  // New compliance & travel handlers
  trackMixpanelEvent: (event, payload) => {
    set((state) => {
      const newEv: MixpanelEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        event,
        timestamp: new Date().toISOString(),
        payload
      };
      return { mixpanelEvents: [newEv, ...state.mixpanelEvents].slice(0, 30) };
    });
  },

  triggerTimezoneTravel: (targetZone) => {
    set((state) => ({
      timezone: targetZone,
      showTimezoneAlert: true
    }));
    const uid = getUid();
    if (uid) {
      updateDoc(doc(db, "users", uid), { timezone: targetZone }).catch(err => console.error(err));
    }
    get().trackMixpanelEvent("timezone_shifted", { previous_zone: "Africa/Lagos", designated_zone: targetZone });
    get().awardXP(100);
  },

  dismissTimezoneAlert: () => {
    set({ showTimezoneAlert: false });
  },

  executeHardDelete: () => {
    set({
      habits: [],
      metrics: [],
      focusHistory: [],
      userXP: 0,
      userLevel: 1,
      mixpanelEvents: [],
      weeklyFocus: "None",
      sleepScore: 0,
      onboardingGoal: null,
      timezone: "UTC",
      showTimezoneAlert: false,
      showBurnoutRecoveryNotice: false,
      showMentalHealthEscalation: false,
      activeAIInsight: null,
      activeAIChat: [
        {
          id: "msg_erased",
          role: "model",
          content: "Zero PII Protocol Active. Your database clusters have been purged. Zero tracking records exist.",
          timestamp: new Date().toISOString()
        }
      ]
    });
  },

  sendCoachMessage: (text) => {
    const userMessage: AIChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };

    const uid = getUid();
    if (uid) {
      setDoc(doc(db, "users", uid, "chats", userMessage.id), userMessage).catch(err => console.error(err));
    } else {
      set((state) => ({
        activeAIChat: [...state.activeAIChat, userMessage]
      }));
    }

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "";
      
      if (lower.includes("exhaust") || lower.includes("tired") || lower.includes("burnout") || lower.includes("sleep")) {
        reply = "Let's dial down active flow stacks. My neuro-circadian analytics recommend skipping high-intensity work blocks today. Let's focus purely on hydration and light walks.";
      } else if (lower.includes("hopeless") || lower.includes("depressed") || lower.includes("can't go on") || lower.includes("cant go on") || lower.includes("suicide")) {
        const uName = get().userName || "User";
        reply = `${uName}, you don't have to carry this alone. Please stop work entirely. I strongly urge you to reach out to a support line or talk to a professional right now. Your health is the absolute priority.`;
      } else if (lower.includes("slack") || lower.includes("slack/email") || lower.includes("morning") || lower.includes("productivity")) {
        reply = "Eliminating morning slack loops lowers prefrontal distractions. Excellent baseline setup. Keep your writing anchor clear and reap the dopamine reward.";
      } else {
        reply = "Understood. Maintaining our circadian target of 2.5L water & moderate deep focus blocks is our priority for optimal neuro-correlation. Synchrony stable.";
      }

      const modelMessage: AIChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: "model",
        content: reply,
        timestamp: new Date().toISOString()
      };

      if (uid) {
        setDoc(doc(db, "users", uid, "chats", modelMessage.id), modelMessage).catch(err => console.error(err));
      } else {
        set((state) => ({
          activeAIChat: [...state.activeAIChat, modelMessage]
        }));
      }

      get().trackMixpanelEvent("ai_insight_interacted", {
        insight_type: "schedule_optimization",
        action_taken: "read",
        query_length: text.length
      });
    }, 1200);
  },

  updateProfile: (profile) => {
    set((state) => ({
      ...state,
      ...profile
    }));
    const uid = getUid();
    if (uid) {
      updateDoc(doc(db, "users", uid), profile).catch(err => console.error(err));
    }
    get().trackMixpanelEvent("profile_updated", profile);
  },

  updateSettings: (settings) => {
    set((state) => ({
      ...state,
      ...settings
    }));
    const uid = getUid();
    if (uid) {
      updateDoc(doc(db, "users", uid), settings).catch(err => console.error(err));
    }
    get().trackMixpanelEvent("settings_updated", settings);
  }

    }),
    {
      name: "habit-flow-theme-storage",
      partialize: (state) => ({
        appTheme: state.appTheme,
        syncToSystemTheme: state.syncToSystemTheme,
      }),
    }
  )
);

