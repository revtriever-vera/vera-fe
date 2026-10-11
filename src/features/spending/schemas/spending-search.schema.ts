import { z } from 'zod';

const MONTH_PATTERN: RegExp = /^\d{4}-(0[1-9]|1[0-2])$/;

const monthParam = z.string().regex(MONTH_PATTERN).optional().catch(undefined);

const textParam = z
    .union([z.string(), z.number().transform(String)])
    .optional()
    .catch(undefined);

export const layoutSearchSchema = z.object({
    importar: z.boolean().optional().catch(undefined)
});

export const monthSearchSchema = z.object({
    month: monthParam
});

export const transactionsSearchSchema = z.object({
    month: monthParam,
    accountId: textParam,
    categoryId: textParam,
    uncategorized: z.boolean().optional().catch(undefined),
    direction: z.enum(['in', 'out']).optional().catch(undefined),
    q: textParam,
    page: z.number().int().min(1).optional().catch(undefined)
});

export type TransactionsSearch = z.infer<typeof transactionsSearchSchema>;
