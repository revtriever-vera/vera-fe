import type { TFunction } from 'i18next';
import { z } from 'zod';
import { RECURRING_CADENCE, RECURRING_CADENCES, RECURRING_KINDS, type ConfirmSeriesBody, type RecurringCadence } from '../types';

export const SERIES_NAME_MAX_LENGTH: number = 80;
const MIN_DAY: number = 1;
const MAX_DAY: number = 31;
const RADIX: number = 10;
const DAY_PATTERN: RegExp = /^\d{1,2}$/;

export function hasExpectedDay(cadence: RecurringCadence): boolean {
    return cadence !== RECURRING_CADENCE.weekly && cadence !== RECURRING_CADENCE.biweekly;
}

function validDay(value: string): boolean {
    const day: number = Number.parseInt(value, RADIX);
    return DAY_PATTERN.test(value.trim()) && day >= MIN_DAY && day <= MAX_DAY;
}

export type ConfirmSeriesSchema = z.ZodEffects<
    z.ZodObject<{
        name: z.ZodString;
        cadence: z.ZodEnum<['weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual']>;
        expectedDay: z.ZodString;
        kind: z.ZodEnum<['subscription', 'bill', 'other']>;
        categoryId: z.ZodString;
        createRule: z.ZodBoolean;
    }>
>;

export function createConfirmSeriesSchema(t: TFunction<'spendingRecurring'>): ConfirmSeriesSchema {
    return z
        .object({
            name: z.string().trim().min(1, t('confirm.errors.nameRequired')).max(SERIES_NAME_MAX_LENGTH, t('confirm.errors.nameTooLong')),
            cadence: z.enum(RECURRING_CADENCES),
            expectedDay: z.string(),
            kind: z.enum(RECURRING_KINDS),
            categoryId: z.string(),
            createRule: z.boolean()
        })
        .superRefine((input, context): void => {
            if (hasExpectedDay(input.cadence) && !validDay(input.expectedDay)) {
                context.addIssue({ code: z.ZodIssueCode.custom, path: ['expectedDay'], message: t('confirm.errors.dayInvalid') });
            }
        });
}

export type ConfirmSeriesFormInput = z.infer<ConfirmSeriesSchema>;

export function toConfirmBody(input: ConfirmSeriesFormInput): ConfirmSeriesBody {
    const withCategory: boolean = input.createRule && input.categoryId !== '';
    return {
        name: input.name.trim(),
        cadence: input.cadence,
        expectedDay: hasExpectedDay(input.cadence) ? Number.parseInt(input.expectedDay, RADIX) : null,
        kind: input.kind,
        ...(withCategory ? { categoryId: input.categoryId, createRule: true } : {})
    };
}
