import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Use direct PostgreSQL URL for the pg adapter (Prisma v7 requires a driver adapter)
    const connectionString =
      process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? '';
    console.log('🔌 Connecting to DB with:', connectionString);
    const pool = new Pool({ 
      connectionString,
      ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
