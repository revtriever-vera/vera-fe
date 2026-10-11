import type { TFunction } from 'i18next';
import type { RuleAppliesTo, RuleMatchType, RuleView } from '../../types';

export const DICTIONARY_README_URL: string =
    'https://github.com/revtriever-vera/vera-api/blob/main/src/modules/spending-categories/data/README.md';

export function ruleLabel(t: TFunction<'spendingRules'>, rule: Pick<RuleView, 'matchType' | 'label'>): string {
    return t(`rules.labels.${rule.matchType}`, { label: rule.label });
}

export function ruleTypeLabel(t: TFunction<'spendingRules'>, matchType: RuleMatchType): string {
    return t(`rules.types.${matchType}`);
}

export function ruleAppliesToLabel(t: TFunction<'spendingRules'>, appliesTo: RuleAppliesTo): string {
    return t(`rules.appliesTo.${appliesTo}`);
}

export function ruleDomId(id: string): string {
    return `rule-${id}`;
}

export function pickerDirection(appliesTo: RuleAppliesTo): 'in' | 'out' | undefined {
    return appliesTo === 'any' ? undefined : appliesTo;
}

export function ruleMatchesSearch(label: string, query: string): boolean {
    const normalize = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
    return normalize(label).includes(normalize(query));
}
