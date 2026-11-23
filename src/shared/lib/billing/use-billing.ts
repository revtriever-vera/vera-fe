import { use } from 'react';
import { BillingContext, type BillingState } from './billing-context';

export function useBilling(): BillingState {
    const state: BillingState | null = use(BillingContext);
    if (state === null) {
        throw new Error('useBilling must be used inside BillingProvider');
    }
    return state;
}
