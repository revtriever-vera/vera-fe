import type { BillingState } from './billing-context';

export type BillingBannerKind = 'past_due' | 'paused' | 'warning';

export function billingBannerKind(billing: Pick<BillingState, 'plan' | 'subscriptionStatus' | 'usage'>): BillingBannerKind | null {
    if (billing.plan === 'free') {
        return null;
    }
    if (billing.subscriptionStatus === 'past_due') {
        return 'past_due';
    }
    if (billing.usage?.state === 'paused') {
        return 'paused';
    }
    return billing.usage?.state === 'warning' ? 'warning' : null;
}
