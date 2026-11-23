import { describe, expect, it } from 'vitest';
import { billingUsage } from '../../../../test/fixtures/billing';
import type { BillingTrial } from './billing-types';
import { billingBannerKind } from './billing-banner-kind';

describe('billingBannerKind', () => {
    it('shows nothing on the Free plan', () => {
        expect(
            billingBannerKind({ plan: 'free', subscriptionStatus: null, trial: null, usage: billingUsage({ state: 'paused' }) })
        ).toBeNull();
    });

    it('shows nothing without usage and without a late invoice', () => {
        expect(billingBannerKind({ plan: 'self_hosted', subscriptionStatus: null, trial: null, usage: null })).toBeNull();
    });

    it('shows nothing while the usage is ok', () => {
        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: 'active', trial: null, usage: billingUsage() })).toBeNull();
    });

    it('warns and pauses by the usage state', () => {
        expect(
            billingBannerKind({ plan: 'premium', subscriptionStatus: 'active', trial: null, usage: billingUsage({ state: 'warning' }) })
        ).toBe('warning');
        expect(
            billingBannerKind({ plan: 'premium', subscriptionStatus: 'active', trial: null, usage: billingUsage({ state: 'paused' }) })
        ).toBe('paused');
    });

    it('puts a late invoice before a paused quota', () => {
        expect(
            billingBannerKind({ plan: 'premium', subscriptionStatus: 'past_due', trial: null, usage: billingUsage({ state: 'paused' }) })
        ).toBe('past_due');
    });

    it('warns a self-hosted installation that has a cap', () => {
        expect(
            billingBannerKind({ plan: 'self_hosted', subscriptionStatus: null, trial: null, usage: billingUsage({ state: 'warning' }) })
        ).toBe('warning');
    });

    it('warns three days before a no-card trial ends, after a late invoice and a paused quota', () => {
        const trial: BillingTrial = { kind: 'no_card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 3 };

        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: null, trial, usage: null })).toBe('trial_ending');
        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: null, trial, usage: billingUsage({ state: 'paused' }) })).toBe(
            'paused'
        );
        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: null, trial, usage: billingUsage({ state: 'warning' }) })).toBe(
            'trial_ending'
        );
    });

    it('does not warn with time left, with a subscription already made or on a card trial', () => {
        const far: BillingTrial = { kind: 'no_card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 4 };
        const near: BillingTrial = { kind: 'no_card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 2 };
        const card: BillingTrial = { kind: 'card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 2 };

        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: null, trial: far, usage: null })).toBeNull();
        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: 'trialing', trial: near, usage: null })).toBeNull();
        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: 'trialing', trial: card, usage: null })).toBeNull();
    });
});
