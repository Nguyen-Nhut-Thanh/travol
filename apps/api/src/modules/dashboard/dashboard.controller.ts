import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Query('range') range?: string) {
    return this.dashboardService.getStats(range);
  }

  @UseGuards(JwtAuthGuard)
  @Get('report')
  async getReport() {
    return this.dashboardService.getReport();
  }
}
