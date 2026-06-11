import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { FirebaseGuard } from "../auth/firebase.guard";
import { FocusService } from "./focus.service";
import { FocusSession } from "../../../packages/shared";

@Controller("focus")
@UseGuards(FirebaseGuard)
export class FocusController {
  constructor(private readonly focusService: FocusService) {}

  @Get("sessions")
  async getFocusHistory(): Promise<FocusSession[]> {
    return this.focusService.getHistory();
  }

  @Post("session")
  async logFocusSession(
    @Body() dto: Omit<FocusSession, "id" | "date">
  ): Promise<FocusSession> {
    return this.focusService.record(dto);
  }
}
