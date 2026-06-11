import { Injectable } from "@nestjs/common";
import { MetricLog } from "../../../packages/shared";

@Injectable()
export class WellnessService {
  private logs: MetricLog[] = [
    {
      id: "log_1",
      date: "2026-06-09",
      sleepScore: 82,
      sleepHours: 7.4,
      waterIntake: 2.2,
      mindState: "Focus",
      gratitudeText: "Clean strategic architecture compiled"
    }
  ];

  async getLogs(): Promise<MetricLog[]> {
    return this.logs;
  }

  async createLog(dto: Omit<MetricLog, "id" | "date">): Promise<MetricLog> {
    const log: MetricLog = {
      ...dto,
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };
    this.logs.push(log);
    return log;
  }
}
