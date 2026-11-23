import { useEffect, useRef, type RefObject } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatDayMonth, usedPercent } from '@/shared/lib/billing/billing-dates';
import type { BillingUsage, BillingUsageState } from '@/shared/lib/billing/billing-types';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useToast, type ToastApi } from './toast-provider';

function crossedUp(previous: BillingUsageState, next: BillingUsageState): boolean {
    return (previous === 'ok' && next !== 'ok') || (previous === 'warning' && next === 'paused');
}

export function useUsageToasts(usage: BillingUsage | null): void {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const toast: ToastApi = useToast();
    const previous: RefObject<BillingUsageState | null> = useRef<BillingUsageState | null>(null);
    const state: BillingUsageState | null = usage?.state ?? null;

    useEffect((): void => {
        const before: BillingUsageState | null = previous.current;
        previous.current = state;
        if (usage === null || before === null || !crossedUp(before, usage.state)) {
            return;
        }
        if (usage.state === 'paused') {
            toast.show({ tone: 'caution', title: t('toast.paused', { date: formatDayMonth(usage.resetsAt, locale) }) });
            return;
        }
        toast.show({ tone: 'caution', title: t('toast.warning', { percent: usedPercent(usage.usedBps) }) });
    }, [state, usage, toast, t, locale]);
}
