import { Habit, MetricLog, FocusSession, Milestone, LeaderboardUser } from "./types";

export const initialHabits: Habit[] = [
  {
    id: "h1",
    title: "Morning Writing & Structure",
    category: "work",
    isActive: true,
    frequency: "Daily",
    streakCount: 0,
    lastDone: null,
    step1: "Pour hot mineral water",
    step2: "Draft top strategic priority",
    step3: "Do not open Slack/Email for 45 mins"
  },
  {
    id: "h2",
    title: "Circadian Alignment Walk",
    category: "wellness",
    isActive: true,
    frequency: "Daily",
    streakCount: 0,
    lastDone: null,
    step1: "Walk with no sunglasses for 10 minutes",
    step2: "Breathe via box-breathing protocol",
    step3: "Hydrate with sodium electrolytes"
  },
  {
    id: "h3",
    title: "Evening Digital Sunset",
    category: "mind",
    isActive: true,
    frequency: "Daily",
    streakCount: 0,
    lastDone: null,
    step1: "Dim key lights to orange/red",
    step2: "Power down computer entirely",
    step3: "Write down 3 gratitude blocks"
  }
];

export const initialMetrics: MetricLog[] = [];

export const initialMilestones: Milestone[] = [
  {
    id: "ms1",
    name: "Flow Mastermind",
    description: "Complete 10 highly productive Deep Work focus loops.",
    icon: "local_fire_department",
    unlockedAt: null,
    targetCount: 10,
    currentCount: 0
  },
  {
    id: "ms2",
    name: "Liquid Vitality",
    description: "Track 2.5L water target for 7 consecutive days.",
    icon: "water_drop",
    unlockedAt: null,
    targetCount: 7,
    currentCount: 0
  },
  {
    id: "ms3",
    name: "Circadian Champion",
    description: "Log optimal sleeping schedules above 80 points 5 times.",
    icon: "bedtime",
    unlockedAt: null,
    targetCount: 5,
    currentCount: 0
  },
  {
    id: "ms4",
    name: "Architect of Habit",
    description: "Formulate 3 or more customized stacking routines in the editor.",
    icon: "cognition",
    unlockedAt: null,
    targetCount: 3,
    currentCount: 0
  }
];

export const initialLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Marcus Aurelius", avatar: "🏛️", level: 14, xp: 9850 },
  { rank: 2, name: "LeBron James", avatar: "👑", level: 11, xp: 7420 },
  { rank: 3, name: "You", avatar: "⚡", level: 1, xp: 0, isSelf: true },
  { rank: 4, name: "Socrates", avatar: "🦉", level: 5, xp: 2980 },
  { rank: 5, name: "Nikola Tesla", avatar: "🔋", level: 4, xp: 2120 },
];
