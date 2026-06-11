import { Injectable } from "@nestjs/common";
import { FocusSession } from "../../../packages/shared";

@Injectable()
export class FocusService {
  private sessions: FocusSession[] = [];

  async getHistory(): Promise<FocusSession[]> {
    return this.sessions;
  }

  async record(dto: Omit<FocusSession, "id" | "date">): Promise<FocusSession> {
    const session: FocusSession = {
      ...dto,
      id: `session_${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };
    this.sessions.push(session);
    return session;
  }
}
