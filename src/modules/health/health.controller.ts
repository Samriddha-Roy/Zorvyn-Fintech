import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    try {
      // Direct query to check DB availability
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'UP',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'DEGRADED',
        database: 'DISCONNECTED',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
