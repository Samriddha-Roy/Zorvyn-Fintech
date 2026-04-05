import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(user: any, dto: CreateTransactionDto): Promise<{
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
    findAll(user: any, query: QueryTransactionDto): Promise<{
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
    getMonthlyBreakdown(user: any): Promise<{
        total: number;
        income: number;
        expense: number;
        month: string;
    }[]>;
    findOne(user: any, id: string): Promise<{
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
    update(user: any, id: string, dto: UpdateTransactionDto): Promise<{
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
    remove(user: any, id: string): Promise<{
        message: string;
    }>;
}
