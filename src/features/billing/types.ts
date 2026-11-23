import type { paths } from '@/shared/lib/api/schema';

export type { BillingMe, BillingUsage, OpenInvoice } from '@/shared/lib/billing/billing-types';
export type PaymentLink = paths['/billing/invoices/{id}/payment-link']['get']['responses']['200']['content']['application/json'];
