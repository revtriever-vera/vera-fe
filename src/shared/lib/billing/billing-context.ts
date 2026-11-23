import { createContext, type Context } from 'react';
import type {
    BillingMode,
    BillingPlan,
    BillingTrial,
    BillingUsage,
    FeatureAccess,
    InvoicePayOrigin,
    OpenInvoice,
    PaidFeature,
    SubscriptionStatus
} from './billing-types';

export interface BillingState {
    readonly isLoading: boolean;
    readonly mode: BillingMode;
    readonly plan: BillingPlan;
    readonly canManage: boolean;
    readonly usage: BillingUsage | null;
    readonly trial: BillingTrial | null;
    readonly subscriptionStatus: SubscriptionStatus | null;
    readonly graceEndsAt: string | null;
    readonly openInvoice: OpenInvoice | null;
    readonly featureState: (feature: PaidFeature) => FeatureAccess;
    readonly refresh: () => Promise<void>;
    readonly payInvoice: (from: InvoicePayOrigin) => Promise<void>;
}

export const BillingContext: Context<BillingState | null> = createContext<BillingState | null>(null);
