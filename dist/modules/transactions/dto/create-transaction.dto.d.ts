import { TransactionType } from '@prisma/client';
export declare class CreateTransactionDto {
    amount: number;
    type: TransactionType;
    category: string;
    date: string;
    notes?: string;
}
