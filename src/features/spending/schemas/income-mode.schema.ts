import type { TFunction } from 'i18next';
import { z } from 'zod';
import { INCOME_MODES, type IncomeMode } from '../types';

export interface IncomeModeFormInput {
    mode: IncomeMode;
    declaredIncomeMinor: number | null;
}

export function createIncomeModeSchema(t: TFunction<'spending'>): z.ZodType<IncomeModeFormInput> {
    return z
        .object({
            mode: z.enum(INCOME_MODES),
            declaredIncomeMinor: z.number().int().nullable()
        })
        .refine((value: IncomeModeFormInput): boolean => value.mode !== 'declared' || (value.declaredIncomeMinor ?? 0) > 0, {
            path: ['declaredIncomeMinor'],
            message: t('income.declaredRequired')
        });
}
