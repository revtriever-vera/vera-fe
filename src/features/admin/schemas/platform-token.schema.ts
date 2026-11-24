import type { TFunction } from 'i18next';
import { z } from 'zod';

export const MAX_TOKEN_NAME_LENGTH: number = 80;

export const TOKEN_VALIDITY_DAYS = {
    month: '30',
    quarter: '90',
    year: '365'
} as const;

export type TokenValidityDays = (typeof TOKEN_VALIDITY_DAYS)[keyof typeof TOKEN_VALIDITY_DAYS];

export interface PlatformTokenFormValues {
    readonly name: string;
    readonly validity: TokenValidityDays;
}

export function createPlatformTokenSchema(t: TFunction<'admin'>): z.ZodType<PlatformTokenFormValues> {
    return z.object({
        name: z
            .string()
            .trim()
            .min(1, t('tokenNameRequired'))
            .max(MAX_TOKEN_NAME_LENGTH, t('tokenNameTooLong', { count: MAX_TOKEN_NAME_LENGTH })),
        validity: z.enum([TOKEN_VALIDITY_DAYS.month, TOKEN_VALIDITY_DAYS.quarter, TOKEN_VALIDITY_DAYS.year])
    });
}

export function toCreateTokenInput(values: PlatformTokenFormValues): { name: string; expiresInDays: number } {
    return { name: values.name.trim(), expiresInDays: Number(values.validity) };
}
