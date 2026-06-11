import { Injectable, NotFoundException } from "@nestjs/common";
import { Habit } from "../../../packages/shared";

@Injectable()
export class HabitsService {
  private habits: Habit[] = [
    {
      id: "h1",
      title: "Morning Writing & Structure",
      category: "work",
      isActive: true,
      frequency: "Daily",
      step1: "Complete first cup of green tea",
      step2: "Open laptop & draft strategic alignment priorities",
      step3: "Check Slack and click done",
      streakCount: 2,
      lastDone: "2026-06-08" // Missed days simulated
    }
  ];

  async findAll(): Promise<Habit[]> {
    return this.habits;
  }

  async create(dto: Omit<Habit, "id" | "streakCount" | "lastDone">): Promise<Habit> {
    const newHabit: Habit = {
      ...dto,
      id: `h_${Date.now()}`,
      streakCount: 0,
      lastDone: null
    };
    this.habits.push(newHabit);
    return newHabit;
  }

  async scaleDown(id: string, s1: string, s2: string, s3: string): Promise<Habit> {
    const habit = this.habits.find((h) => h.id === id);
    if (!habit) throw new NotFoundException("Routines layout not found");
    
    habit.step1 = s1;
    habit.step2 = s2;
    habit.step3 = s3;
    habit.streakCount = Math.max(1, habit.streakCount + 1);
    habit.lastDone = new Date().toISOString().split("T")[0];
    
    return habit;
  }

  async delete(id: string): Promise<void> {
    this.habits = this.habits.filter((h) => h.id !== id);
  }
}
