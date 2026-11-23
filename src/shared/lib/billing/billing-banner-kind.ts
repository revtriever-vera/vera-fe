import type { BillingState } from './billing-context';
import { isNoCardTrialEnding } from './trial-ending';

export type BillingBannerKind = 'past_due' | 'paused' | 'trial_ending' | 'warning';

export function billingBannerKind(
    billing: Pick<BillingState, 'plan' | 'subscriptionStatus' | 'usage' | 'trial'>
): BillingBannerKind | null {
    if (billing.plan === 'free') {
        return null;
    }
    if (billing.subscriptionStatus === 'past_due') {
        return 'past_due';
    }
    if (billing.usage?.state === 'paused') {
        return 'paused';
    }
    if (isNoCardTrialEnding(billing.trial, billing.subscriptionStatus !== null)) {
        return 'trial_ending';
    }
    return billing.usage?.state === 'warning' ? 'warning' : null;
}
