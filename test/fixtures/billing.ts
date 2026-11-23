import type { BillingMe, BillingSubscription, BillingUsage, InvoiceRow } from '@/features/billing/types';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import type { FeatureAccess } from '@/shared/lib/billing/billing-types';

export function billingUsage(overrides: Partial<BillingUsage> = {}): BillingUsage {
    return {
        usedBps: 3400,
        state: 'ok',
        resetsAt: '2026-11-01T03:00:00.000Z',
        byFeature: { ai: { usedBps: 2000 }, whatsapp: { usedBps: 1400 } },
        capMicros: null,
        ...overrides
    };
}

export function billingMe(overrides: Partial<BillingMe> = {}): BillingMe {
    return {
        mode: 'hosted',
        plan: 'premium',
        canManage: true,
        methods: ['card', 'pix'],
        priceCents: 1490,
        currency: 'BRL',
        subscription: null,
        openInvoice: null,
        trial: null,
        offer: null,
        features: { ai: 'available', whatsapp: 'available', calendar: 'available' },
        usage: null,
        ...overrides
    };
}

export function freeBilling(overrides: Partial<BillingMe> = {}): BillingMe {
    return billingMe({
        plan: 'free',
        features: { ai: 'premium_required', whatsapp: 'premium_required', calendar: 'premium_required' },
        ...overrides
    });
}

export function selfHostedBilling(overrides: Partial<BillingMe> = {}): BillingMe {
    return billingMe({ mode: 'self_hosted', plan: 'self_hosted', methods: [], priceCents: null, ...overrides });
}

export function billingState(overrides: Partial<BillingState> = {}): BillingState {
    return {
        isLoading: false,
        mode: 'hosted',
        plan: 'premium',
        canManage: true,
        usage: null,
        trial: null,
        subscriptionStatus: 'active',
        graceEndsAt: null,
        openInvoice: null,
        featureState: (): FeatureAccess => 'available',
        refresh: async (): Promise<void> => Promise.resolve(),
        payInvoice: async (): Promise<void> => Promise.resolve(),
        ...overrides
    };
}

export function billingSubscription(overrides: Partial<BillingSubscription> = {}): BillingSubscription {
    return {
        status: 'active',
        method: 'card',
        since: '2026-09-09T12:00:00.000Z',
        paidThrough: '2026-12-09T12:00:00.000Z',
        nextChargeAt: '2026-12-09T12:00:00.000Z',
        card: { brand: 'visa', last4: '4242' },
        graceEndsAt: null,
        withdrawalEndsAt: null,
        canResume: false,
        discount: null,
        nextChargeAmountMinor: 1490,
        ...overrides
    };
}

export function invoiceRow(overrides: Partial<InvoiceRow> = {}): InvoiceRow {
    return {
        id: 'inv_1',
        cycleStart: '2026-10-09T12:00:00.000Z',
        cycleEnd: '2026-11-09T12:00:00.000Z',
        totalCents: 1490,
        method: 'card',
        status: 'paid',
        dueDate: '2026-10-09T12:00:00.000Z',
        paidAt: '2026-10-09T12:00:00.000Z',
        ...overrides
    };
}
