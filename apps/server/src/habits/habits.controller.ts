import { Controller, Get, Post, Delete, Body, Param, UseGuards, Put } from "@nestjs/common";
import { FirebaseGuard } from "../auth/firebase.guard";
import { HabitsService } from "./habits.service";
import { Habit } from "../../../packages/shared";

@Controller("habits")
@UseGuards(FirebaseGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  async getActiveHabits(): Promise<Habit[]> {
    return this.habitsService.findAll();
  }

  @Post()
  async createHabit(
    @Body() dto: Omit<Habit, "id" | "streakCount" | "lastDone">
  ): Promise<Habit> {
    return this.habitsService.create(dto);
  }

  @Put(":id/scale")
  async scaleHabit(
    @Param("id") id: string,
    @Body() steps: { step1: string; step2: string; step3: string }
  ): Promise<Habit> {
    return this.habitsService.scaleDown(id, steps.step1, steps.step2, steps.step3);
  }

  @Delete(":id")
  async deleteHabit(@Param("id") id: string): Promise<{ success: boolean }> {
    await this.habitsService.delete(id);
    return { success: true };
  }
}
