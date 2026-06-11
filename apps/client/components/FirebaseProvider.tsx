import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  getDocFromServer, 
  onSnapshot 
} from "firebase/firestore";
import { auth, db, googleProvider, OperationType, handleFirestoreError } from "../lib/firebase";
import { useHabitStore } from "../store/useHabitStore";
import { 
  initialHabits, 
  initialMetrics, 
  initialMilestones 
} from "../../../src/preconstructedData";
import { Habit, MetricLog, FocusSession, Milestone, AIChatMessage } from "../types";

interface FirebaseAndGuestUser {
  uid: string;
  displayName: string;
  email: string;
  isGuest?: boolean;
}

interface FirebaseContextType {
  user: User | FirebaseAndGuestUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useFirebase must be used within a FirebaseProvider");
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Synchronize state once store hydrates.
  useEffect(() => {
    // 1. Verify Firestore Connectivity initially
    const verifyConnectivity = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.warn("Firebase client appears to be offline. Local persistence will buffer changes.");
        }
      }
    };
    verifyConnectivity();
  }, []);

  useEffect(() => {
    // Check if there was an active guest session in local storage
    const savedGuest = localStorage.getItem("habitflow_guest_session");
    let initialGuest: any = null;
    if (savedGuest) {
      try {
        const parsed = JSON.parse(savedGuest);
        if (parsed && parsed.isGuest) {
          initialGuest = parsed;
          setUser(parsed);
          setLoading(false);
          
          // Ensure view is updated
          const currentStoreView = useHabitStore.getState().currentView;
          if (currentStoreView === "welcome") {
            useHabitStore.setState({ currentView: "dashboard" });
          }
        }
      } catch (e) {
        console.error("Failed to parse guest session", e);
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);
        const uid = currentUser.uid;

        try {
          // Check if User profile document exists
          const userDocRef = doc(db, "users", uid);
          const userSnap = await getDoc(userDocRef);

          if (!userSnap.exists()) {
            // Seed new user data securely
            const defaultUser = {
              userName: currentUser.displayName || "New User",
              userXP: 0,
              userLevel: 1,
              weeklyFocus: "",
              sleepScore: 0,
              timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Africa/Lagos",
              onboardingGoal: null,
              onboardingSleepHours: 8.0,
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
              strictBlockMode: false,
              autoFocusDetection: false,
              soundscapeVolume: 50,
              coachSensitivity: 50,
              recoveryAlerts: true,
              habitReminders: true,
              weeklyBriefings: false,
              appTheme: "ambient-green",
              syncToSystemTheme: false,
            };

            await setDoc(userDocRef, defaultUser);

            // Seed Habits
            for (const hab of initialHabits) {
              await setDoc(doc(db, "users", uid, "habits", hab.id), {
                title: hab.title,
                category: hab.category,
                isActive: hab.isActive,
                frequency: hab.frequency,
                streakCount: hab.streakCount,
                lastDone: hab.lastDone,
                step1: hab.step1,
                step2: hab.step2,
                step3: hab.step3,
              });
            }

            // Seed Metrics
            for (const met of initialMetrics) {
              await setDoc(doc(db, "users", uid, "metrics", met.id), {
                date: met.date,
                sleepScore: met.sleepScore,
                sleepHours: met.sleepHours,
                waterIntake: met.waterIntake,
                mindState: met.mindState,
                gratitudeText: met.gratitudeText || "",
              });
            }

            // Seed Milestones
            for (const mile of initialMilestones) {
              await setDoc(doc(db, "users", uid, "milestones", mile.id), {
                name: mile.name,
                description: mile.description,
                icon: mile.icon,
                unlockedAt: mile.unlockedAt,
                targetCount: mile.targetCount,
                currentCount: mile.currentCount,
              });
            }

            // Seed Message
            const initMessageId = "msg_welcome";
            await setDoc(doc(db, "users", uid, "chats", initMessageId), {
              role: "model",
              content: `Welcome to HabitFlow AI. Log your first biomarkers or configure a daily focus routine to activate the biological coach.`,
              timestamp: new Date().toISOString(),
            });
          } else {
            const existingData = userSnap.data();
            if (existingData && (existingData.userName === "Alex" || existingData.userName === "New User") && currentUser.displayName && currentUser.displayName !== existingData.userName) {
              await setDoc(userDocRef, { userName: currentUser.displayName }, { merge: true });
            }
            // Reset old template data (Level 6 / 3450 XP) to ensure a complete clean slate at Level 1
            if (existingData && (existingData.userXP === 3450 || existingData.userLevel === 6)) {
              await setDoc(userDocRef, {
                userXP: 0,
                userLevel: 1,
                userTitle: "Novice",
                weeklyFocus: "",
                sleepScore: 0,
              }, { merge: true });
            }
          }

          // Force Zustand view to go straight to dashboard once logged in on standard workflow
          const currentStoreView = useHabitStore.getState().currentView;
          if (currentStoreView === "welcome") {
            useHabitStore.setState({ currentView: "dashboard" });
          }

          // 2. Setup Real-time Firebase listeners to update Zustand
          onSnapshot(doc(db, "users", uid), (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              useHabitStore.setState({
                weeklyFocus: data.weeklyFocus ?? useHabitStore.getState().weeklyFocus,
                sleepScore: data.sleepScore ?? useHabitStore.getState().sleepScore,
                userXP: data.userXP ?? useHabitStore.getState().userXP,
                userLevel: data.userLevel ?? useHabitStore.getState().userLevel,
                timezone: data.timezone ?? useHabitStore.getState().timezone,
                onboardingGoal: data.onboardingGoal ?? useHabitStore.getState().onboardingGoal,
                onboardingSleepHours: data.onboardingSleepHours ?? useHabitStore.getState().onboardingSleepHours,
                userName: data.userName ?? useHabitStore.getState().userName,
                userTitle: data.userTitle ?? useHabitStore.getState().userTitle,
                userBio: data.userBio ?? useHabitStore.getState().userBio,
                focusTarget: data.focusTarget ?? useHabitStore.getState().focusTarget,
                sleepWindowTarget: data.sleepWindowTarget ?? useHabitStore.getState().sleepWindowTarget,
                soundscapeTrack: data.soundscapeTrack ?? useHabitStore.getState().soundscapeTrack,
                activeSoundscapeTimer: data.activeSoundscapeTimer ?? useHabitStore.getState().activeSoundscapeTimer,
                biometricsAppleConnected: data.biometricsAppleConnected ?? useHabitStore.getState().biometricsAppleConnected,
                biometricsOuraConnected: data.biometricsOuraConnected ?? useHabitStore.getState().biometricsOuraConnected,
                strictBlockMode: data.strictBlockMode ?? useHabitStore.getState().strictBlockMode,
                autoFocusDetection: data.autoFocusDetection ?? useHabitStore.getState().autoFocusDetection,
                soundscapeVolume: data.soundscapeVolume ?? useHabitStore.getState().soundscapeVolume,
                coachSensitivity: data.coachSensitivity ?? useHabitStore.getState().coachSensitivity,
                recoveryAlerts: data.recoveryAlerts ?? useHabitStore.getState().recoveryAlerts,
                habitReminders: data.habitReminders ?? useHabitStore.getState().habitReminders,
                weeklyBriefings: data.weeklyBriefings ?? useHabitStore.getState().weeklyBriefings,
                appTheme: data.appTheme ?? useHabitStore.getState().appTheme,
                syncToSystemTheme: data.syncToSystemTheme ?? useHabitStore.getState().syncToSystemTheme,
              });
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${uid}`);
          });

          onSnapshot(collection(db, "users", uid, "habits"), (snapshot) => {
            const habits: Habit[] = [];
            snapshot.forEach((doc) => {
              habits.push({ id: doc.id, ...doc.data() } as Habit);
            });
            if (habits.length > 0) {
              useHabitStore.setState({ habits });
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, `users/${uid}/habits`);
          });

          onSnapshot(collection(db, "users", uid, "metrics"), (snapshot) => {
            const metrics: MetricLog[] = [];
            snapshot.forEach((doc) => {
              metrics.push({ id: doc.id, ...doc.data() } as MetricLog);
            });
            if (metrics.length > 0) {
              metrics.sort((a, b) => a.date.localeCompare(b.date));
              useHabitStore.setState({ metrics });
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, `users/${uid}/metrics`);
          });

          onSnapshot(collection(db, "users", uid, "focusHistory"), (snapshot) => {
            const focusHistory: FocusSession[] = [];
            snapshot.forEach((doc) => {
              focusHistory.push({ id: doc.id, ...doc.data() } as FocusSession);
            });
            focusHistory.sort((a, b) => b.date.localeCompare(a.date));
            useHabitStore.setState({ focusHistory });
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, `users/${uid}/focusHistory`);
          });

          onSnapshot(collection(db, "users", uid, "milestones"), (snapshot) => {
            const milestones: Milestone[] = [];
            snapshot.forEach((doc) => {
              milestones.push({ id: doc.id, ...doc.data() } as Milestone);
            });
            if (milestones.length > 0) {
              milestones.sort((a, b) => a.id.localeCompare(b.id));
              useHabitStore.setState({ milestones });
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, `users/${uid}/milestones`);
          });

          onSnapshot(collection(db, "users", uid, "chats"), (snapshot) => {
            const activeAIChat: AIChatMessage[] = [];
            snapshot.forEach((doc) => {
              activeAIChat.push({ id: doc.id, ...doc.data() } as AIChatMessage);
            });
            if (activeAIChat.length > 0) {
              activeAIChat.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
              useHabitStore.setState({ activeAIChat });
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, `users/${uid}/chats`);
          });

        } catch (error) {
          console.error("Error setting up Firestore subscriptions: ", error);
        }
        setLoading(false);
      } else {
        setUser((prev: any) => {
          if (prev && prev.isGuest) return prev;
          if (initialGuest) return initialGuest;
          return null;
        });
        if (!initialGuest && !savedGuest) {
          setLoading(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Sign in failed: ", err);
      let errMsg = "An authentication sync error occurred.";
      if (err && typeof err === "object") {
        if (err.code === "auth/cancelled-popup-request" || err.message?.includes("cancelled-popup-request")) {
          errMsg = "An authorization popup was already pending or has been cancelled. Please close existing sign-in windows and try again. Alternatively, select \"Continue as Guest\" below.";
        } else if (err.code === "auth/popup-blocked") {
          errMsg = "The login popup was blocked by your browser. Please allow popups for this site, open this application in a new tab, or use \"Continue as Guest\" below.";
        } else if (err.code === "auth/popup-closed-by-user") {
          errMsg = "The Google login window was closed before completion. Please click again to retry, or bypass via \"Continue as Guest\" below.";
        } else if (err.code === "auth/internal-error" || err.message?.includes("internal-error")) {
          errMsg = "An internal browser sandbox limitation prevented Google Login. This frequently occurs inside iframe environments. Please use the \"Continue as Guest\" override below to run the app in fully-functional secure offline/local sandbox mode.";
        } else {
          errMsg = err.message || JSON.stringify(err);
        }
      } else {
        errMsg = String(err);
      }
      setAuthError(errMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser = {
      uid: "guest_local_user",
      displayName: "Guest",
      email: "guest@local-only.dev",
      isGuest: true
    };
    localStorage.setItem("habitflow_guest_session", JSON.stringify(guestUser));
    setUser(guestUser);
    
    // Immediately display the dashboard for guest users
    const currentStoreView = useHabitStore.getState().currentView;
    if (currentStoreView === "welcome") {
      useHabitStore.setState({ currentView: "dashboard" });
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("habitflow_guest_session");
      await signOut(auth);
      useHabitStore.getState().executeHardDelete();
      useHabitStore.setState({ currentView: "welcome" });
    } catch (err) {
      console.error("Sign out failed: ", err);
    }
  };

  if (loading) {
    return (
      <div id="firebase-loading-barrier" className="min-h-screen bg-[#111415] text-[#e1e3e4] flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#95d4b3] to-[#e9c176] flex items-center justify-center animate-spin">
            <span className="material-symbols-outlined text-2xl font-bold text-[#2f3133]">sync</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#95d4b3]">Loading Ambient Crypt-Identity State...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div id="firebase-auth-barrier" className="min-h-screen bg-[#111415] text-[#e1e3e4] flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#95d4b3]/30">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#191c1d] border border-[#323536] shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          
          {/* Top aesthetic ambient gradients */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#95d4b3] via-[#e9c176] to-[#95d4b3]" />
          
          {/* Main central graphic logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#95d4b3] to-[#e9c176] flex items-center justify-center text-[#2f3133] shadow-lg mb-6 animate-pulse">
            <span className="material-symbols-outlined text-3xl font-extrabold">local_fire_department</span>
          </div>

          <h1 className="font-display font-extrabold text-2xl tracking-tight text-[#e1e3e4] mb-2">HabitFlow AI</h1>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#95d4b3] bg-[#12533a]/30 px-3 py-1 rounded-full mb-6">
            Cloud-Authenticated Wellness Panel
          </span>

          <p className="text-sm text-[#c5c6ca] leading-relaxed mb-6 max-w-sm">
            Leverage high-integrity prefrontal logs, real-time biomarker synchronization, and AI bio-correlation. Authentic, private, and zero-telemetry by design.
          </p>

          {authError && (
            <div id="firebase-auth-error" className="w-full mb-6 p-4 rounded-xl bg-[#2e1d1d] border border-[#ea4335]/30 text-left">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#ea4335] text-sm shrink-0 mt-0.5">error</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold text-[#ea4335] uppercase tracking-wider">Authentication Error</span>
                  <p className="text-[11px] text-[#e1e3e4] leading-relaxed">{authError}</p>
                </div>
              </div>
            </div>
          )}

          <button
            id="firebase-google-auth-btn"
            type="button"
            onClick={login}
            disabled={loginLoading}
            className={`w-full py-4 px-6 bg-gradient-to-r from-[#95d4b3]/20 to-[#e9c176]/20 hover:from-[#95d4b3]/35 hover:to-[#e9c176]/35 border border-[#95d4b3]/60 text-[#e1e3e4] text-xs font-mono font-extrabold rounded-xl transition-all tracking-wider flex items-center justify-center gap-3 cursor-pointer shadow-md active:scale-[0.98] ${
              loginLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loginLoading ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin text-[#95d4b3]">sync</span>
                CONNECTING IDENTITY...
              </>
            ) : (
              <>
                {/* Simple Inline Custom Google G-Logo Vector */}
                <svg className="w-4 h-4 fill-current text-[#95d4b3]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                CONNECT GOOGLE IDENTITY
              </>
            )}
          </button>

          <div className="w-full flex flex-col gap-2.5 mt-4">
            <button
              id="firebase-guest-bypass-btn"
              type="button"
              onClick={loginAsGuest}
              className="w-full py-3.5 px-6 bg-[#1f2223] hover:bg-[#252829] border border-[#323536] hover:border-[#8f9194]/40 text-[#c5c6ca] hover:text-[#e1e3e4] text-[11px] font-mono font-bold rounded-xl transition-all tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm text-[#e2c185]">cloud_off</span>
              CONTINUE AS GUEST (LOCAL PLAYGROUND)
            </button>
          </div>

          <span className="text-[9px] font-mono text-[#8f9194] uppercase tracking-widest mt-7">
            SECURED BY FIREBASE CRYPTO AUTH
          </span>
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={{ user, loading, login, logout, loginAsGuest }}>
      {children}
    </FirebaseContext.Provider>
  );
};
