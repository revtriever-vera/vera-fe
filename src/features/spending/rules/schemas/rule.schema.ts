import type { TFunction } from 'i18next';
import { z } from 'zod';
import { CREATABLE_RULE_TYPES, RULE_APPLIES_TO, RULE_PATTERN_MAX_LENGTH, RULE_PATTERN_MIN_LENGTH, type RuleAppliesTo } from '../../types';

export interface RuleFormInput {
    matchType: (typeof CREATABLE_RULE_TYPES)[number];
    pattern: string;
    appliesTo: RuleAppliesTo;
    categoryId: string;
    applyToPast: boolean;
}

export function createRuleSchema(t: TFunction<'spendingRules'>): z.ZodType<RuleFormInput> {
    return z.object({
        matchType: z.enum(CREATABLE_RULE_TYPES),
        pattern: z
            .string()
            .trim()
            .min(RULE_PATTERN_MIN_LENGTH, t('newRule.errors.patternTooShort'))
            .max(RULE_PATTERN_MAX_LENGTH, t('newRule.errors.patternTooLong')),
        appliesTo: z.enum(RULE_APPLIES_TO),
        categoryId: z.string().min(1, t('newRule.errors.categoryRequired')),
        applyToPast: z.boolean()
    });
}
