import type { TFunction } from 'i18next';
import { z } from 'zod';

export const MIN_REASON_LENGTH: number = 5;
export const MAX_REASON_LENGTH: number = 300;

export interface OpenAccountFormValues {
    readonly reason: string;
    readonly summary: boolean;
    readonly data: boolean;
}

export function createOpenAccountSchema(t: TFunction<'admin'>): z.ZodType<OpenAccountFormValues> {
    return z
        .object({
            reason: z
                .string()
                .trim()
                .min(1, t('openReasonRequired'))
                .min(MIN_REASON_LENGTH, t('openReasonTooShort', { count: MIN_REASON_LENGTH }))
                .max(MAX_REASON_LENGTH, t('openReasonTooLong', { count: MAX_REASON_LENGTH })),
            summary: z.boolean(),
            data: z.boolean()
        })
        .refine((values): boolean => values.summary || values.data, { path: ['summary'], message: t('openLayersRequired') });
}
