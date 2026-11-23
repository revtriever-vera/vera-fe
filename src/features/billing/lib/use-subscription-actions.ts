import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useCancelSubscription } from '../api/use-cancel-subscription.mutation';
import { useResumeSubscription } from '../api/use-resume-subscription.mutation';
import type { BillingMe, CancelResult } from '../types';
import { billingErrorMessage } from './billing-error-message';
import { longDate } from './billing-format';

export interface SubscriptionActions {
    readonly cancel: (onDone: () => void) => void;
    readonly resume: () => void;
    readonly canceling: boolean;
    readonly resuming: boolean;
}

type Translate = UseTranslationResponse<'billing', undefined>['t'];

function canceledTitle(t: Translate, result: CancelResult, locale: SupportedLocale): string {
    if (result.endedNow) {
        return t('toasts.canceledNow');
    }
    const until: string | null = result.subscription?.paidThrough ?? null;
    return until === null ? t('toasts.canceledNoDate') : t('toasts.canceled', { date: longDate(until, locale) });
}

function resumedTitle(t: Translate, me: BillingMe, locale: SupportedLocale): string {
    const next: string | null = me.subscription?.nextChargeAt ?? null;
    return next === null ? t('toasts.resumedNoDate') : t('toasts.resumed', { date: longDate(next, locale) });
}

export function useSubscriptionActions(): SubscriptionActions {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const toast: ToastApi = useToast();
    const cancel: UseMutationResult<CancelResult, Error, void> = useCancelSubscription();
    const resume: UseMutationResult<BillingMe, Error, void> = useResumeSubscription();
    const fail = (error: Error): void => {
        toast.show({ tone: 'critical', title: billingErrorMessage(t, error) });
    };
    return {
        canceling: cancel.isPending,
        resuming: resume.isPending,
        cancel: (onDone: () => void): void => {
            cancel.mutate(undefined, {
                onSuccess: (result: CancelResult): void => {
                    onDone();
                    track('subscription_canceled', { endedNow: result.endedNow });
                    toast.show({ tone: 'positive', title: canceledTitle(t, result, locale) });
                },
                onError: (error: Error): void => {
                    onDone();
                    fail(error);
                }
            });
        },
        resume: (): void => {
            resume.mutate(undefined, {
                onSuccess: (me: BillingMe): void => {
                    track('subscription_resumed');
                    toast.show({ tone: 'positive', title: resumedTitle(t, me, locale) });
                },
                onError: fail
            });
        }
    };
}
