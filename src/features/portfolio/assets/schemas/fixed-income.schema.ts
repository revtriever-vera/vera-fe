import type { TFunction } from 'i18next';
import { z } from 'zod';
import { MIN_APPLIED_DATE, RATE_RANGE_BPS } from '../lib/fixed-income-defaults';
import { parseRateBps } from '../lib/rate-input';
import {
    ASSET_CURRENCIES,
    FIXED_INCOME_INDEXERS,
    FIXED_INCOME_KINDS,
    type AssetCurrency,
    type FixedIncomeIndexer,
    type FixedIncomeKind
} from '../types';

const NAME_MAX_LENGTH: number = 80;
const CONTROL_CHARACTERS: RegExp = /\p{Cc}/u;

export interface FixedIncomeFormInput {
    kind: FixedIncomeKind;
    name: string;
    indexer: FixedIncomeIndexer;
    rate: string;
    applied: number | null;
    currency: AssetCurrency;
    appliedAt: string | null;
    maturityDate: string | null;
    classId: string;
}

function rateIsValid(input: FixedIncomeFormInput): boolean {
    const bps: number | null = parseRateBps(input.rate);
    const range: { min: number; max: number } = RATE_RANGE_BPS[input.indexer];
    return bps !== null && bps >= range.min && bps <= range.max;
}

function appliedAtIssue(input: FixedIncomeFormInput, today: string, t: TFunction<'portfolioAssets'>): string | null {
    if (input.appliedAt === null) {
        return t('fixedIncome.errors.appliedAtRequired');
    }
    return input.appliedAt < MIN_APPLIED_DATE || input.appliedAt > today ? t('fixedIncome.errors.appliedAtOutOfRange') : null;
}

function maturityIssue(input: FixedIncomeFormInput, t: TFunction<'portfolioAssets'>): string | null {
    if (input.maturityDate === null) {
        return t('fixedIncome.errors.maturityRequired');
    }
    return input.appliedAt !== null && input.maturityDate <= input.appliedAt ? t('fixedIncome.errors.maturityBeforeApplied') : null;
}

function report(ctx: z.RefinementCtx, path: string, message: string | null): void {
    if (message !== null) {
        ctx.addIssue({ code: 'custom', path: [path], message });
    }
}

function checkDates(input: FixedIncomeFormInput, today: string, t: TFunction<'portfolioAssets'>, ctx: z.RefinementCtx): void {
    report(ctx, 'appliedAt', appliedAtIssue(input, today, t));
    report(ctx, 'maturityDate', maturityIssue(input, t));
}

function checkTerms(input: FixedIncomeFormInput, t: TFunction<'portfolioAssets'>, ctx: z.RefinementCtx): void {
    if (!rateIsValid(input)) {
        ctx.addIssue({ code: 'custom', path: ['rate'], message: t('fixedIncome.errors.rateOutOfRange') });
    }
    if (input.applied === null || input.applied <= 0) {
        ctx.addIssue({ code: 'custom', path: ['applied'], message: t('fixedIncome.errors.appliedRequired') });
    }
    if (input.currency === 'USD' && input.indexer !== 'prefixed') {
        ctx.addIssue({ code: 'custom', path: ['currency'], message: t('fixedIncome.errors.usdRequiresPrefixed') });
    }
}

export function createFixedIncomeSchema(t: TFunction<'portfolioAssets'>, today: string): z.ZodType<FixedIncomeFormInput> {
    return z
        .object({
            kind: z.enum(FIXED_INCOME_KINDS),
            name: z
                .string()
                .trim()
                .min(1, t('fixedIncome.errors.nameRequired'))
                .max(NAME_MAX_LENGTH, t('fixedIncome.errors.nameTooLong'))
                .refine((value: string): boolean => !CONTROL_CHARACTERS.test(value), t('fixedIncome.errors.nameRequired')),
            indexer: z.enum(FIXED_INCOME_INDEXERS),
            rate: z.string().trim().min(1, t('fixedIncome.errors.rateRequired')),
            applied: z.number().nullable(),
            currency: z.enum(ASSET_CURRENCIES),
            appliedAt: z.string().nullable(),
            maturityDate: z.string().nullable(),
            classId: z.string().min(1, t('fixedIncome.errors.classRequired'))
        })
        .superRefine((input: FixedIncomeFormInput, ctx: z.RefinementCtx): void => {
            checkDates(input, today, t, ctx);
            checkTerms(input, t, ctx);
        });
}
