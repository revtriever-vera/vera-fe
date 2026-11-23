import { describe, expect, it } from 'vitest';
import { billingUsage } from '../../../../test/fixtures/billing';
import { billingBannerKind } from './billing-banner-kind';

describe('billingBannerKind', () => {
    it('shows nothing on the Free plan', () => {
        expect(billingBannerKind({ plan: 'free', subscriptionStatus: null, usage: billingUsage({ state: 'paused' }) })).toBeNull();
    });

    it('shows nothing without usage and without a late invoice', () => {
        expect(billingBannerKind({ plan: 'self_hosted', subscriptionStatus: null, usage: null })).toBeNull();
    });

    it('shows nothing while the usage is ok', () => {
        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: 'active', usage: billingUsage() })).toBeNull();
    });

    it('warns and pauses by the usage state', () => {
        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: 'active', usage: billingUsage({ state: 'warning' }) })).toBe(
            'warning'
        );
        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: 'active', usage: billingUsage({ state: 'paused' }) })).toBe(
            'paused'
        );
    });

    it('puts a late invoice before a paused quota', () => {
        expect(billingBannerKind({ plan: 'premium', subscriptionStatus: 'past_due', usage: billingUsage({ state: 'paused' }) })).toBe(
            'past_due'
        );
    });

    it('warns a self-hosted installation that has a cap', () => {
        expect(billingBannerKind({ plan: 'self_hosted', subscriptionStatus: null, usage: billingUsage({ state: 'warning' }) })).toBe(
            'warning'
        );
    });
});
