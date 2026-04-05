import { PrismaService } from '@database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
export declare class TransactionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateTransactionDto): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: number;
        category: string;
        date: Date;
        notes: string | null;
    }>;
    findAll(userId: string, query: any): Promise<{
        data: {
            type: import("@prisma/client").$Enums.TransactionType;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            amount: number;
            category: string;
            date: Date;
            notes: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(userId: string, id: string): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: number;
        category: string;
        date: Date;
        notes: string | null;
    }>;
    update(userId: string, id: string, dto: UpdateTransactionDto): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        amount: number;
        category: string;
        date: Date;
        notes: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        message: string;
    }>;
    getGlobalAnalytics(): Promise<{
        total: number;
        income: number;
        expense: number;
        month: string;
    }[]>;
    getMonthlyBreakdown(userId: string): Promise<{
        total: number;
        income: number;
        expense: number;
        month: string;
    }[]>;
}
