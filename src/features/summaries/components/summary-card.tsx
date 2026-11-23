import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { BillingState } from '@/shared/lib/billing/billing-context';
import { formatDayMonth } from '@/shared/lib/billing/billing-dates';
import { useBilling } from '@/shared/lib/billing/use-billing';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Loading, Skeleton, SkeletonText } from '@/shared/ui/skeleton';
import { useAiConsent } from '../api/use-ai-consent.query';
import { useSummary } from '../api/use-summary.query';
import { summaryErrorMessage } from '../lib/summary-error-message';
import { summaryDescription, summaryTitle } from '../lib/summary-titles';
import { useSummaryParams } from '../lib/use-summary-params';
import type { ConsentState, SummaryKind, SummaryParams, SummaryView } from '../types';
import { SummaryBody } from './summary-body';
import { SummaryConsent } from './summary-consent';
import { SummaryLocked } from './summary-locked';
import { SummaryShell } from './summary-shell';

export interface SummaryCardProps {
    readonly kind: SummaryKind;
    readonly month?: string;
    readonly goalBps?: number;
}

interface GrantedProps {
    readonly kind: SummaryKind;
    readonly month: string | undefined;
    readonly params: SummaryParams;
}

function CardLoading({ kind, month }: { readonly kind: SummaryKind; readonly month: string | undefined }): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const locale: SupportedLocale = useLocale();
    return (
        <SummaryShell title={summaryTitle(t, kind, month, locale)} description={summaryDescription(t, kind)}>
            <Loading label={t('card.loading')}>
                <SkeletonText lines={3} />
            </Loading>
        </SummaryShell>
    );
}

function CardFailure({
    kind,
    month,
    error
}: {
    readonly kind: SummaryKind;
    readonly month: string | undefined;
    readonly error: Error;
}): ReactElement {
    const { t }: UseTranslationResponse<'summaries', undefined> = useTranslation('summaries');
    const locale: SupportedLocale = useLocale();
    const billing: BillingState = useBilling();
    const resetDate: string | null = billing.usage === null ? null : formatDayMonth(billing.usage.resetsAt, locale);
    return (
        <SummaryShell title={summaryTitle(t, kind, month, locale)} description={summaryDescription(t, kind)}>
            <Alert title={summaryErrorMessage(t, error, resetDate)} />
        </SummaryShell>
    );
}

function SummaryLoaded({ kind, month, params }: GrantedProps): ReactElement | null {
    const query: UseQueryResult<SummaryView | null> = useSummary(kind, params, true);
    if (query.error !== null) {
        return <CardFailure kind={kind} month={month} error={query.error} />;
    }
    if (query.data === undefined) {
        return <CardLoading kind={kind} month={month} />;
    }
    return query.data === null ? null : <SummaryBody kind={kind} month={month} params={params} view={query.data} />;
}

function SummaryGranted({ kind, month, params }: GrantedProps): ReactElement | null {
    const consent: UseQueryResult<ConsentState> = useAiConsent();
    if (consent.error !== null) {
        return <CardFailure kind={kind} month={month} error={consent.error} />;
    }
    if (consent.data === undefined) {
        return <Skeleton className="h-28 w-full" />;
    }
    if (!consent.data.available) {
        return null;
    }
    if (consent.data.needsConsent) {
        return <SummaryConsent kind={kind} month={month} params={params} consent={consent.data} />;
    }
    return <SummaryLoaded kind={kind} month={month} params={params} />;
}

export function SummaryCard({ kind, month, goalBps }: SummaryCardProps): ReactElement | null {
    const billing: BillingState = useBilling();
    const params: SummaryParams = useSummaryParams(kind, month, goalBps);
    const access: ReturnType<BillingState['featureState']> = billing.featureState('ai');
    if (access === 'loading' || access === 'disabled') {
        return null;
    }
    if (access === 'premium_required') {
        return <SummaryLocked kind={kind} month={month} />;
    }
    return <SummaryGranted kind={kind} month={month} params={params} />;
}
