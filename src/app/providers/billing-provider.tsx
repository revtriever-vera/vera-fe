import { useCallback, useEffect, useMemo, type ReactElement, type ReactNode } from 'react';
import { useQueryClient, type QueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { billingKeys } from '@/features/billing/api/billing-keys';
import { useBillingMe } from '@/features/billing/api/use-billing-me.query';
import { useInvoicePaymentLink } from '@/features/billing/api/use-invoice-payment-link.mutation';
import type { PaymentLink } from '@/features/billing/types';
import { setProblemListener } from '@/shared/lib/api/client';
import { track } from '@/shared/lib/analytics';
import { BillingContext, type BillingState } from '@/shared/lib/billing/billing-context';
import type { BillingMe, FeatureAccess, InvoicePayOrigin, PaidFeature } from '@/shared/lib/billing/billing-types';
import { openPaymentLink } from '@/shared/lib/billing/open-payment-link';
import { useToast, type ToastApi } from './toast-provider';
import { useUsageToasts } from './use-usage-toasts';

const INVALIDATING_PROBLEMS: ReadonlySet<string> = new Set<string>(['billing.premium_required', 'usage.cap_reached']);

function useInvalidateOnProblem(queryClient: QueryClient): void {
    useEffect(
        (): (() => void) =>
            setProblemListener((type: string): void => {
                if (INVALIDATING_PROBLEMS.has(type)) {
                    void queryClient.invalidateQueries({ queryKey: billingKeys.me() });
                }
            }),
        [queryClient]
    );
}

function accessOf(query: UseQueryResult<BillingMe>, feature: PaidFeature): FeatureAccess {
    if (query.data !== undefined) {
        return query.data.features[feature];
    }
    return query.isPending ? 'loading' : 'available';
}

function usePayInvoice(openInvoiceId: string | null): BillingState['payInvoice'] {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const toast: ToastApi = useToast();
    const link: UseMutationResult<PaymentLink, Error, string> = useInvoicePaymentLink();
    const { mutateAsync } = link;
    return useCallback(
        async (from: InvoicePayOrigin): Promise<void> => {
            if (openInvoiceId === null) {
                return;
            }
            track('invoice_pay_clicked', { from });
            try {
                await openPaymentLink(async (): Promise<string> => (await mutateAsync(openInvoiceId)).url);
            } catch {
                toast.show({ tone: 'critical', title: t('toast.payFailed') });
            }
        },
        [openInvoiceId, mutateAsync, toast, t]
    );
}

type BillingData = Pick<
    BillingState,
    'mode' | 'plan' | 'canManage' | 'usage' | 'trial' | 'subscriptionStatus' | 'graceEndsAt' | 'openInvoice'
>;

const EMPTY_DATA: BillingData = {
    mode: 'hosted',
    plan: 'free',
    canManage: false,
    usage: null,
    trial: null,
    subscriptionStatus: null,
    graceEndsAt: null,
    openInvoice: null
};

function dataOf(me: BillingMe | undefined): BillingData {
    if (me === undefined) {
        return EMPTY_DATA;
    }
    return {
        mode: me.mode,
        plan: me.plan,
        canManage: me.canManage,
        usage: me.usage,
        trial: me.trial,
        subscriptionStatus: me.subscription?.status ?? null,
        graceEndsAt: me.subscription?.graceEndsAt ?? null,
        openInvoice: me.openInvoice
    };
}

export function BillingProvider({ children }: { readonly children: ReactNode }): ReactElement {
    const queryClient: QueryClient = useQueryClient();
    const query: UseQueryResult<BillingMe> = useBillingMe();
    const payInvoice: BillingState['payInvoice'] = usePayInvoice(query.data?.openInvoice?.id ?? null);
    useInvalidateOnProblem(queryClient);
    useUsageToasts(query.data?.usage ?? null);

    const value: BillingState = useMemo(
        (): BillingState => ({
            ...dataOf(query.data),
            isLoading: query.isPending,
            featureState: (feature: PaidFeature): FeatureAccess => accessOf(query, feature),
            refresh: async (): Promise<void> => queryClient.invalidateQueries({ queryKey: billingKeys.me() }),
            payInvoice
        }),
        [query, queryClient, payInvoice]
    );

    return <BillingContext value={value}>{children}</BillingContext>;
}
