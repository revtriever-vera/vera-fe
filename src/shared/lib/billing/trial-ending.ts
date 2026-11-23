import type { BillingTrial } from '@/shared/lib/billing/billing-types';

export const TRIAL_WARNING_DAYS: number = 3;

export function isNoCardTrialEnding(trial: BillingTrial | null, hasSubscription: boolean): boolean {
    return trial !== null && trial.kind === 'no_card' && !hasSubscription && trial.daysLeft <= TRIAL_WARNING_DAYS;
}
