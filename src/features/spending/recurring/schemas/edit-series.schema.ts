import type { TFunction } from 'i18next';
import { z } from 'zod';
import { RECURRING_CADENCES, RECURRING_KINDS, RECURRING_VALUE_MODES, type UpdateSeriesBody } from '../types';
import { hasExpectedDay, SERIES_NAME_MAX_LENGTH, validDay } from './confirm-series.schema';

const RADIX: number = 10;

export type EditSeriesSchema = z.ZodEffects<
    z.ZodObject<{
        name: z.ZodString;
        cadence: z.ZodEnum<['weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual']>;
        expectedDay: z.ZodString;
        valueMode: z.ZodEnum<['fixed', 'variable']>;
        kind: z.ZodEnum<['subscription', 'bill', 'other']>;
    }>
>;

export function createEditSeriesSchema(t: TFunction<'spendingRecurring'>): EditSeriesSchema {
    return z
        .object({
            name: z.string().trim().min(1, t('confirm.errors.nameRequired')).max(SERIES_NAME_MAX_LENGTH, t('confirm.errors.nameTooLong')),
            cadence: z.enum(RECURRING_CADENCES),
            expectedDay: z.string(),
            valueMode: z.enum(RECURRING_VALUE_MODES),
            kind: z.enum(RECURRING_KINDS)
        })
        .superRefine((input, context): void => {
            if (hasExpectedDay(input.cadence) && !validDay(input.expectedDay)) {
                context.addIssue({ code: z.ZodIssueCode.custom, path: ['expectedDay'], message: t('confirm.errors.dayInvalid') });
            }
        });
}

export type EditSeriesFormInput = z.infer<EditSeriesSchema>;

export function toUpdateBody(input: EditSeriesFormInput): UpdateSeriesBody {
    return {
        name: input.name.trim(),
        cadence: input.cadence,
        expectedDay: hasExpectedDay(input.cadence) ? Number.parseInt(input.expectedDay, RADIX) : null,
        valueMode: input.valueMode,
        kind: input.kind
    };
}
