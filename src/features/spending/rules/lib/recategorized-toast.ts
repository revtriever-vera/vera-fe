import type { TFunction } from 'i18next';

export type RecategorizedToastKey = 'ruleCreated' | 'ruleUpdated' | 'ruleDeleted' | 'categoryDeleted';

export function recategorizedToast(t: TFunction<'spendingRules'>, key: RecategorizedToastKey, count: number): string {
    return t(`toasts.${key}`, { count });
}
