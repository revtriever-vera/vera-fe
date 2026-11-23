import type { TFunction } from 'i18next';
import { z } from 'zod';
import type { TrialKind } from '../types';
import { noCardLastIso, todayIso } from '../lib/signup-link-dates';
import { MAX_PERCENT, MAX_RULES, MAX_TRIAL_DAYS, TRIAL_KIND } from '../lib/signup-link-offer';

const MAX_LABEL: number = 80;
const MAX_USES: number = 1_000_000;
export interface SignupLinkFormValues {
    readonly label: string;
    readonly trialKind: TrialKind;
    readonly days: string;
    readonly maxUses: string;
    readonly expiresAt: string | null;
    readonly rules: { percent: string; fromCycle: string; toCycle: string }[];
}

type ExpiryIssue = 'formExpiryRequired' | 'formExpiryPast' | 'formExpiryTooFar';

const INTEGER: RegExp = /^\d+$/;

export const trialKindSchema = z.enum([TRIAL_KIND.none, TRIAL_KIND.card, TRIAL_KIND.noCard]);

const ruleSchema = z.object({ percent: z.string(), fromCycle: z.string(), toCycle: z.string() });

export function inRange(text: string, min: number, max: number): boolean {
    const value: number = Number(text);
    return INTEGER.test(text.trim()) && value >= min && value <= max;
}

function checkRules(rules: readonly z.infer<typeof ruleSchema>[], t: TFunction<'admin'>, ctx: z.RefinementCtx): void {
    rules.forEach((rule: z.infer<typeof ruleSchema>, index: number): void => {
        if (!inRange(rule.percent, 1, MAX_PERCENT)) {
            ctx.addIssue({ code: 'custom', path: ['rules', index, 'percent'], message: t('formPercentInvalid') });
        }
        if (!inRange(rule.fromCycle, 1, 1200)) {
            ctx.addIssue({ code: 'custom', path: ['rules', index, 'fromCycle'], message: t('formCycleInvalid') });
        }
        if (!inRange(rule.toCycle, Number(rule.fromCycle) || 1, 1200)) {
            ctx.addIssue({ code: 'custom', path: ['rules', index, 'toCycle'], message: t('formCycleRangeInvalid') });
        }
    });
}

function checkTrial(values: SignupLinkFormValues, t: TFunction<'admin'>, ctx: z.RefinementCtx): void {
    if (values.trialKind !== TRIAL_KIND.none && !inRange(values.days, 1, MAX_TRIAL_DAYS)) {
        ctx.addIssue({ code: 'custom', path: ['days'], message: t('formDaysInvalid') });
    }
}

function checkUses(values: SignupLinkFormValues, t: TFunction<'admin'>, ctx: z.RefinementCtx): void {
    const noCard: boolean = values.trialKind === TRIAL_KIND.noCard;
    const hasUses: boolean = values.maxUses.trim() !== '';
    if (hasUses ? !inRange(values.maxUses, 1, MAX_USES) : noCard) {
        ctx.addIssue({ code: 'custom', path: ['maxUses'], message: t(noCard ? 'formMaxUsesRequired' : 'formMaxUsesInvalid') });
    }
}

function expiryIssue(values: SignupLinkFormValues, noCard: boolean): ExpiryIssue | null {
    if (values.expiresAt === null) {
        return noCard ? 'formExpiryRequired' : null;
    }
    if (values.expiresAt < todayIso()) {
        return 'formExpiryPast';
    }
    return noCard && values.expiresAt > noCardLastIso() ? 'formExpiryTooFar' : null;
}

function checkExpiry(values: SignupLinkFormValues, t: TFunction<'admin'>, ctx: z.RefinementCtx): void {
    const issue: ExpiryIssue | null = expiryIssue(values, values.trialKind === TRIAL_KIND.noCard);
    if (issue !== null) {
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: t(issue) });
    }
}

export function createSignupLinkSchema(t: TFunction<'admin'>): z.ZodType<SignupLinkFormValues, z.ZodTypeDef, SignupLinkFormValues> {
    return z
        .object({
            label: z.string().trim().min(1, t('formLabelRequired')).max(MAX_LABEL, t('formLabelTooLong')),
            trialKind: trialKindSchema,
            days: z.string(),
            maxUses: z.string(),
            expiresAt: z.string().nullable(),
            rules: z.array(ruleSchema).max(MAX_RULES, t('formTooManyRules'))
        })
        .superRefine((values: SignupLinkFormValues, ctx: z.RefinementCtx): void => {
            checkTrial(values, t, ctx);
            checkUses(values, t, ctx);
            checkExpiry(values, t, ctx);
            checkRules(values.rules, t, ctx);
        });
}
