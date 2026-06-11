export interface Habit {
  id: string;
  title: string;
  category: "work" | "wellness" | "mind";
  isActive: boolean;
  frequency: string;
  streakCount: number;
  lastDone: string | null; // ISO string or date string
  step1: string;
  step2: string;
  step3: string;
}

export interface MetricLog {
  id: string;
  date: string; // YYYY-MM-DD
  sleepScore: number; // 0 - 100
  sleepHours: number;
  waterIntake: number; // in Liters
  mindState: "Focus" | "Calm" | "Nervous" | "Tired";
  gratitudeText?: string;
  beverage?: string;
}

export interface FocusSession {
  id: string;
  date: string;
  durationMinutes: number;
  soundscape: string;
  completed: boolean;
  activityName: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  targetCount: number;
  currentCount: number;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  isSelf?: boolean;
}

export interface AIChatMessage {
  id: string;
  role: "system" | "user" | "model";
  content: string;
  timestamp: string;
}

