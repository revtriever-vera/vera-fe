import { addDays, discountedCents, trialDays } from '@/shared/lib/billing/offer-pricing';
import type { BillingOffer } from '@/shared/lib/billing/billing-types';
import type { BillingMe } from '../types';

const FIRST_PAID_CYCLE: number = 1;

export interface CheckoutOffer {
    readonly offer: BillingOffer | null;
    readonly cardOnly: boolean;
    readonly firstCents: number | null;
    readonly chargeDate: Date | null;
}

export function isCardTrialOffer(me: BillingMe): boolean {
    return me.plan === 'free' && me.subscription === null && me.offer?.trial.kind === 'card' && trialDays(me.offer.trial) > 0;
}

function chargeDateOf(me: BillingMe, now: Date): Date | null {
    if (me.offer !== null && isCardTrialOffer(me)) {
        return addDays(now, trialDays(me.offer.trial));
    }
    return me.trial === null ? null : new Date(me.trial.endsAt);
}

export function checkoutOfferOf(me: BillingMe, now: Date): CheckoutOffer {
    const offer: BillingOffer | null = me.subscription === null ? me.offer : null;
    return {
        offer,
        cardOnly: isCardTrialOffer(me),
        firstCents: me.priceCents === null ? null : discountedCents(me.priceCents, offer?.rules ?? [], FIRST_PAID_CYCLE),
        chargeDate: chargeDateOf(me, now)
    };
}
