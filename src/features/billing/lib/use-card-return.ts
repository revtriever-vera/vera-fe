import { useEffect, useRef, type RefObject } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { useConfirmCard } from '../api/use-confirm-card.mutation';
import type { CardReturnResult } from '../schemas/billing-search.schema';
import type { BillingMe } from '../types';
import { billingErrorCode, billingErrorMessage } from './billing-error-message';

export interface CardReturnHandlers {
    readonly clear: () => void;
    readonly onWaiting: () => void;
    readonly onFailed: () => void;
}

export function useCardReturn(result: CardReturnResult | undefined, handlers: CardReturnHandlers): void {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const toast: ToastApi = useToast();
    const billing: BillingState = useBilling();
    const confirm: UseMutationResult<BillingMe, Error, void> = useConfirmCard();
    const handled: RefObject<boolean> = useRef<boolean>(false);
    const { mutate } = confirm;
    const { clear, onWaiting, onFailed } = handlers;
    const swapping: boolean = billing.plan === 'premium';
    useEffect((): void => {
        if (result === undefined) {
            handled.current = false;
            return;
        }
        if (handled.current) {
            return;
        }
        handled.current = true;
        track('card_capture_returned', { result });
        clear();
        if (result === 'canceled') {
            toast.show({ tone: 'neutral', title: t('checkout.cardCanceled') });
            return;
        }
        if (!swapping) onWaiting();
        mutate(undefined, {
            onSuccess: (): void => {
                if (swapping) {
                    toast.show({ tone: 'positive', title: t('checkout.cardUpdated') });
                }
            },
            onError: (error: Error): void => {
                track('checkout_failed', { method: 'card', code: billingErrorCode(error) });
                toast.show({ tone: 'critical', title: billingErrorMessage(t, error) });
                onFailed();
            }
        });
    }, [result, swapping, clear, onWaiting, onFailed, mutate, toast, t]);
}
