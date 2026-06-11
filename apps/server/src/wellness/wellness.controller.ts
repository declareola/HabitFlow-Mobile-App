import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { FirebaseGuard } from "../auth/firebase.guard";
import { WellnessService } from "./wellness.service";
import { MetricLog } from "../../../packages/shared";

@Controller("wellness")
@UseGuards(FirebaseGuard)
export class WellnessController {
  constructor(private readonly wellnessService: WellnessService) {}

  @Get("logs")
  async getMetricsLogs(): Promise<MetricLog[]> {
    return this.wellnessService.getLogs();
  }

  @Post("log")
  async createMetricLog(
    @Body() dto: Omit<MetricLog, "id" | "date">
  ): Promise<MetricLog> {
    return this.wellnessService.createLog(dto);
  }
}
