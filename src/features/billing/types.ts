import type { paths } from '@/shared/lib/api/schema';
import type { BillingSubscription } from '@/shared/lib/billing/billing-types';

export type { BillingMe, BillingSubscription, BillingUsage, OpenInvoice } from '@/shared/lib/billing/billing-types';
export type PaymentLink = paths['/billing/invoices/{id}/payment-link']['get']['responses']['200']['content']['application/json'];
export type CheckoutMethod = BillingSubscription['method'];
export type SubscribeResult = paths['/billing/subscription']['post']['responses']['201']['content']['application/json'];
export type InvoicesPage = paths['/billing/invoices']['get']['responses']['200']['content']['application/json'];
export type InvoiceRow = InvoicesPage['items'][number];
export type CardCaptureSession =
    paths['/billing/payment-method/capture-session']['post']['responses']['200']['content']['application/json'];
export type CancelResult = paths['/billing/subscription/cancel']['post']['responses']['200']['content']['application/json'];
export const INVOICES_PAGE_SIZE: number = 12;
export const REFUND_BUSINESS_DAYS: number = 10;
