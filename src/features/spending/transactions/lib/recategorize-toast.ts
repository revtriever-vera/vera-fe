import type { TFunction } from 'i18next';

export interface RecategorizeOutcome {
    readonly reverted: boolean;
    readonly ruleLabel: string | null;
    readonly recategorized: number;
}

export interface RecategorizeMessage {
    readonly title: string;
    readonly detail?: string;
}

export function recategorizeToast(t: TFunction<'spendingTransactions'>, outcome: RecategorizeOutcome): RecategorizeMessage {
    if (outcome.reverted) {
        return { title: t('toast.reverted') };
    }
    if (outcome.ruleLabel === null) {
        return { title: t('toast.applied') };
    }
    if (outcome.recategorized <= 0) {
        return { title: t('toast.applied'), detail: t('toast.ruleCreated', { target: outcome.ruleLabel }) };
    }
    return {
        title: t('toast.applied'),
        detail: t('toast.ruleCreatedWithCount', { target: outcome.ruleLabel, count: outcome.recategorized })
    };
}
