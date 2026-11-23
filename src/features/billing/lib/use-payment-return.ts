import { useEffect } from 'react';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { PREMIUM_POLL_MAX_MS, PREMIUM_POLL_MS, usePolling } from './poll';

export interface PremiumWatch {
    readonly timedOut: boolean;
}

export function usePremiumArrival(active: boolean, onArrived: () => void): PremiumWatch {
    const billing: BillingState = useBilling();
    const arrived: boolean = billing.plan === 'premium';
    const timedOut: boolean = usePolling({
        active: active && !arrived,
        everyMs: PREMIUM_POLL_MS,
        maxMs: PREMIUM_POLL_MAX_MS,
        tick: (): void => {
            void billing.refresh();
        }
    });
    useEffect((): void => {
        if (active && arrived) {
            onArrived();
        }
    }, [active, arrived, onArrived]);
    return { timedOut };
}
