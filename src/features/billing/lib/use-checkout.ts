import { useCallback, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { openPaymentLink } from '@/shared/lib/billing/open-payment-link';
import { useInvoicePaymentLink } from '../api/use-invoice-payment-link.mutation';
import { useSubscribe } from '../api/use-subscribe.mutation';
import type { BillingMe, CheckoutMethod, PaymentLink, SubscribeResult } from '../types';
import { billingErrorCode, billingErrorMessage } from './billing-error-message';
import { usePremiumArrival, type PremiumWatch } from './use-payment-return';

export type CheckoutStage = 'form' | 'pix' | 'wait' | 'done';

export interface Checkout {
    readonly method: CheckoutMethod;
    readonly setMethod: (method: CheckoutMethod) => void;
    readonly stage: CheckoutStage;
    readonly captureUrl: string | null;
    readonly dismissCapture: () => void;
    readonly paymentUrl: string | null;
    readonly failure: Error | null;
    readonly submit: () => void;
    readonly pay: (invoiceId: string) => void;
    readonly subscribing: boolean;
    readonly paying: boolean;
    readonly watch: PremiumWatch;
    readonly doneMethod: CheckoutMethod;
}

function usePayment(
    onOpened: () => void,
    onUrl: (url: string) => void
): { readonly pay: (invoiceId: string) => void; readonly paying: boolean } {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const toast: ToastApi = useToast();
    const paymentLink: UseMutationResult<PaymentLink, Error, string> = useInvoicePaymentLink();
    const { mutateAsync } = paymentLink;
    const pay = (invoiceId: string): void => {
        openPaymentLink(async (): Promise<string> => {
            const link: PaymentLink = await mutateAsync(invoiceId);
            onUrl(link.url);
            return link.url;
        }).then(onOpened, (error: unknown): void => {
            const cause: Error = error instanceof Error ? error : new Error('payment link');
            track('checkout_failed', { method: 'pix', code: billingErrorCode(cause) });
            toast.show({ tone: 'critical', title: billingErrorMessage(t, cause) });
        });
    };
    return { pay, paying: paymentLink.isPending };
}

function useSubmit(
    method: CheckoutMethod,
    setCaptureUrl: (url: string) => void,
    setStage: (stage: CheckoutStage) => void,
    setFailure: (error: Error | null) => void,
    subscribe: UseMutationResult<SubscribeResult, Error, CheckoutMethod>
): () => void {
    return (): void => {
        setFailure(null);
        track('checkout_started', { method });
        subscribe.mutate(method, {
            onSuccess: (result: SubscribeResult): void => {
                if (result.next === 'card_capture') {
                    setCaptureUrl(result.captureUrl);
                    return;
                }
                setStage('pix');
            },
            onError: (error: Error): void => {
                track('checkout_failed', { method, code: billingErrorCode(error) });
                setFailure(error);
            }
        });
    };
}

export function useCheckout(me: BillingMe, startWaiting: boolean): Checkout {
    const subscribe: UseMutationResult<SubscribeResult, Error, CheckoutMethod> = useSubscribe();
    const [method, setMethod] = useState<CheckoutMethod>(me.methods.includes('pix') ? 'pix' : 'card');
    const [stage, setStage] = useState<CheckoutStage>(startWaiting ? 'wait' : 'form');
    const [captureUrl, setCaptureUrl] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [failure, setFailure] = useState<Error | null>(null);
    const doneMethod: CheckoutMethod = startWaiting ? 'card' : method;
    const onArrived: () => void = useCallback((): void => {
        track('checkout_completed', { method: doneMethod });
        setStage('done');
    }, [doneMethod]);
    const watch: PremiumWatch = usePremiumArrival(stage === 'wait', onArrived);
    const payment: { readonly pay: (invoiceId: string) => void; readonly paying: boolean } = usePayment((): void => {
        setStage('wait');
    }, setPaymentUrl);
    const submit: () => void = useSubmit(method, setCaptureUrl, setStage, setFailure, subscribe);
    return {
        method,
        setMethod,
        stage,
        captureUrl,
        dismissCapture: (): void => {
            setCaptureUrl(null);
        },
        paymentUrl,
        failure,
        submit,
        pay: payment.pay,
        subscribing: subscribe.isPending,
        paying: payment.paying,
        watch,
        doneMethod
    };
}
