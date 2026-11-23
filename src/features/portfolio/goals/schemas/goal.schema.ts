import type { TFunction } from 'i18next';
import { z } from 'zod';
import type { SupportedLocale } from '@/shared/lib/locale';
import { parsePercentInput } from '../../lib/parse-percent-input';
import { freeBpsOf, type ShareTexts } from '../lib/goal-holdings';
import { MAX_GOAL_NAME_LENGTH, type GoalKind } from '../types';

export interface GoalFormInput {
    kind: GoalKind;
    name: string;
    targetMinor: number | null;
    targetDate: string | null;
    manualMinor: number | null;
    holder: string;
    reserveMonths: number;
    monthlySpend: number | null;
    shares: ShareTexts;
}

export interface GoalSchemaContext {
    readonly today: string;
    readonly originalDate: string | null;
    readonly locale: SupportedLocale;
    readonly usedBps: ReadonlyMap<string, number>;
}

function shareMessage(text: string, key: string, context: GoalSchemaContext, t: TFunction<'portfolioGoals'>): string | null {
    const bps: number | null = parsePercentInput(text, context.locale);
    if (bps === null || bps === 0) {
        return t('form.errors.shareInvalid');
    }
    return bps > freeBpsOf(context.usedBps, key) ? t('form.errors.shareOverFree') : null;
}

function addShareIssues(texts: ShareTexts, context: GoalSchemaContext, t: TFunction<'portfolioGoals'>, issues: z.RefinementCtx): void {
    for (const [key, text] of Object.entries(texts)) {
        const message: string | null = text.trim() === '' ? null : shareMessage(text, key, context, t);
        if (message !== null) {
            issues.addIssue({ code: 'custom', message, path: [key] });
        }
    }
}

export function createGoalSchema(t: TFunction<'portfolioGoals'>, context: GoalSchemaContext): z.ZodType<GoalFormInput> {
    return z.object({
        kind: z.enum(['emergency_reserve', 'travel', 'home_down_payment', 'other']),
        name: z
            .string()
            .trim()
            .min(1, t('form.errors.nameRequired'))
            .max(MAX_GOAL_NAME_LENGTH, t('form.errors.nameTooLong', { max: MAX_GOAL_NAME_LENGTH })),
        targetMinor: z
            .number()
            .nullable()
            .refine((value: number | null): boolean => value !== null && value > 0, { message: t('form.errors.targetRequired') }),
        targetDate: z
            .string()
            .nullable()
            .refine((value: string | null): boolean => value !== null, { message: t('form.errors.dateRequired') })
            .refine((value: string | null): boolean => value === null || value === context.originalDate || value > context.today, {
                message: t('form.errors.datePast')
            }),
        manualMinor: z.number().int().min(0).nullable(),
        holder: z.string(),
        reserveMonths: z.number(),
        monthlySpend: z.number().int().min(0).nullable(),
        shares: z.record(z.string(), z.string()).superRefine((texts: ShareTexts, issues: z.RefinementCtx): void => {
            addShareIssues(texts, context, t, issues);
        })
    });
}
