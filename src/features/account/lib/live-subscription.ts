import type { BillingState } from '@/shared/lib/billing/billing-context';

export function cancelsPremiumOnDelete(billing: Pick<BillingState, 'mode' | 'plan' | 'subscriptionStatus'>): boolean {
    const live: boolean = billing.subscriptionStatus === 'active' || billing.subscriptionStatus === 'past_due';
    return billing.mode === 'hosted' && billing.plan === 'premium' && live;
}
