"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
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
    async findAll(userId, query) {
        const { type, category, startDate, endDate, page = 1, limit = 20, search } = query;
        const where = { userId };
        if (type)
            where.type = type;
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
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
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
    async findOne(userId, id) {
        const tx = await this.prisma.transaction.findUnique({ where: { id } });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found');
        if (tx.userId !== userId)
            throw new common_1.ForbiddenException();
        return tx;
    }
    async update(userId, id, dto) {
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
    async remove(userId, id) {
        await this.findOne(userId, id);
        await this.prisma.transaction.delete({ where: { id } });
        return { message: 'Transaction deleted' };
    }
    async getGlobalAnalytics() {
        const transactions = await this.prisma.transaction.findMany({
            select: { amount: true, type: true, date: true },
            orderBy: { date: 'asc' },
        });
        const months = {};
        for (const tx of transactions) {
            const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
            if (!months[key])
                months[key] = { income: 0, expense: 0 };
            if (tx.type === 'INCOME')
                months[key].income += tx.amount;
            else
                months[key].expense += tx.amount;
        }
        return Object.entries(months).map(([month, values]) => ({
            month,
            ...values,
            total: values.income - values.expense
        }));
    }
    async getMonthlyBreakdown(userId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
            select: { amount: true, type: true, date: true },
            orderBy: { date: 'asc' },
        });
        const months = {};
        for (const tx of transactions) {
            const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
            if (!months[key])
                months[key] = { income: 0, expense: 0 };
            if (tx.type === 'INCOME')
                months[key].income += tx.amount;
            else
                months[key].expense += tx.amount;
        }
        return Object.entries(months).map(([month, values]) => ({
            month,
            ...values,
            total: values.income - values.expense
        }));
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map