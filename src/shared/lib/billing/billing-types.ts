import type { paths } from '@/shared/lib/api/schema';

export type BillingMe = paths['/billing/me']['get']['responses']['200']['content']['application/json'];
export type BillingMode = BillingMe['mode'];
export type BillingPlan = BillingMe['plan'];
export type FeatureState = BillingMe['features']['ai'];
export type BillingUsage = NonNullable<BillingMe['usage']>;
export type BillingUsageState = BillingUsage['state'];
export type BillingSubscription = NonNullable<BillingMe['subscription']>;
export type SubscriptionStatus = BillingSubscription['status'];
export type OpenInvoice = NonNullable<BillingMe['openInvoice']>;
export type PaidFeature = keyof BillingMe['features'];
export type FeatureAccess = FeatureState | 'loading';
export type InvoicePayOrigin = 'banner' | 'plan';
