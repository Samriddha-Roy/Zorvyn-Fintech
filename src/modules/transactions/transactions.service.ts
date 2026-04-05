import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        amount: dto.amount,
        type: dto.type,
        category: dto.category,
        date: new Date(dto.date),
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: string, query: any) {
    const { type, category, startDate, endDate, page = 1, limit = 20, search } = query;

    const where: any = { userId };
    
    if (type) where.type = type;
    
    if (category) {
        where.category = { contains: category, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { category: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.userId !== userId) throw new ForbiddenException();
    return tx;
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOne(userId, id);
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.type && { type: dto.type }),
        ...(dto.category && { category: dto.category }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.transaction.delete({ where: { id } });
    return { message: 'Transaction deleted' };
  }

  async getGlobalAnalytics() {
    // Collect all transactions, anonymized, and group by month
    const transactions = await this.prisma.transaction.findMany({
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' },
    });

    const months: Record<string, { income: number; expense: number }> = {};
    for (const tx of transactions) {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { income: 0, expense: 0 };
      if (tx.type === 'INCOME') months[key].income += tx.amount;
      else months[key].expense += tx.amount;
    }

    return Object.entries(months).map(([month, values]) => ({
      month,
      ...values,
      total: values.income - values.expense
    }));
  }

  async getMonthlyBreakdown(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' },
    });

    const months: Record<string, { income: number; expense: number }> = {};
    for (const tx of transactions) {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) months[key] = { income: 0, expense: 0 };
      if (tx.type === 'INCOME') months[key].income += tx.amount;
      else months[key].expense += tx.amount;
    }

    return Object.entries(months).map(([month, values]) => ({
      month,
      ...values,
      total: values.income - values.expense
    }));
  }
}
