import { describe, expect, it } from 'vitest';
import { billingMe, billingSubscription, freeBilling } from '../../../../test/fixtures/billing';
import type { BillingMe } from '../types';
import { checkoutOfferOf, isCardTrialOffer, type CheckoutOffer } from './checkout-offer';

const NOW: Date = new Date('2026-11-23T12:00:00.000Z');

function offerOf(kind: 'none' | 'card' | 'no_card', days: number | null): NonNullable<BillingMe['offer']> {
    return {
        trial: { kind, days },
        rules: [{ percent: 50, fromCycle: 1, toCycle: 3 }],
        redeemedAt: '2026-11-20T12:00:00.000Z',
        expiresAt: '2026-12-20T12:00:00.000Z'
    };
}

describe('checkoutOfferOf', () => {
    it('applies the first rule to the price of the first paid cycle', () => {
        const result: CheckoutOffer = checkoutOfferOf(freeBilling({ offer: offerOf('none', null) }), NOW);

        expect(result.firstCents).toBe(745);
        expect(result.cardOnly).toBe(false);
        expect(result.chargeDate).toBeNull();
    });

    it('defers the first charge by the card trial days and forces the card', () => {
        const me: BillingMe = freeBilling({ offer: offerOf('card', 14) });
        const result: CheckoutOffer = checkoutOfferOf(me, NOW);

        expect(isCardTrialOffer(me)).toBe(true);
        expect(result.cardOnly).toBe(true);
        expect(result.chargeDate?.getTime()).toBe(new Date('2026-12-07T12:00:00.000Z').getTime());
    });

    it('charges at the end of a running no-card trial', () => {
        const me: BillingMe = billingMe({ trial: { kind: 'no_card', endsAt: '2026-12-01T12:00:00.000Z', daysLeft: 8 } });

        expect(checkoutOfferOf(me, NOW).chargeDate?.toISOString()).toBe('2026-12-01T12:00:00.000Z');
    });

    it('ignores the offer once there is a subscription and keeps the full price without rules', () => {
        const me: BillingMe = billingMe({ subscription: billingSubscription(), offer: offerOf('card', 14) });
        const result: CheckoutOffer = checkoutOfferOf(me, NOW);

        expect(result.offer).toBeNull();
        expect(result.firstCents).toBe(1490);
        expect(isCardTrialOffer(me)).toBe(false);
    });

    it('has no price for a self-hosted installation', () => {
        expect(checkoutOfferOf(billingMe({ priceCents: null }), NOW).firstCents).toBeNull();
    });
});
