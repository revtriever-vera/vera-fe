import { z } from 'zod';

export const billingSearchSchema = z.object({
    card: z.enum(['saved', 'canceled']).optional().catch(undefined)
});

export type BillingSearch = z.infer<typeof billingSearchSchema>;
export type CardReturnResult = NonNullable<BillingSearch['card']>;
