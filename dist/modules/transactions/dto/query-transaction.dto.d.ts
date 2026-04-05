import { TransactionType } from '@prisma/client';
export declare class QueryTransactionDto {
    type?: TransactionType;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
