import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { TARGETS_NOT_SET, TOO_MANY_REQUESTS, type ContributionSuggestion } from '../types';
import { SuggestionResult } from './suggestion-result';
import { TargetsNotSet } from './targets-not-set';

export interface SuggestionPanelProps {
    readonly amountMinor: number | null;
    readonly query: UseQueryResult<ContributionSuggestion>;
}

function SuggestionLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    return (
        <Loading label={t('loading')} className="flex flex-col gap-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </Loading>
    );
}

function SuggestionFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    if (error instanceof ApiError && error.problem.type === TARGETS_NOT_SET) {
        return <TargetsNotSet />;
    }
    return (
        <div className="flex flex-col items-start gap-3">
            {error instanceof ApiError && error.status === TOO_MANY_REQUESTS ? (
                <Alert tone="caution" title={t('error.title')} detail={t('error.rateLimited')} />
            ) : (
                <FailureAlert error={error} title={t('error.title')} />
            )}
            <Button variant="secondary" onClick={onRetry}>
                {t('error.retry')}
            </Button>
        </div>
    );
}

export function SuggestionPanel({ amountMinor, query }: SuggestionPanelProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    if (amountMinor === null) {
        return <p className="surface-card px-4 py-8 text-center text-sm text-content-muted">{t('empty')}</p>;
    }
    if (query.error !== null) {
        return (
            <SuggestionFailure
                error={query.error}
                onRetry={(): void => {
                    void query.refetch();
                }}
            />
        );
    }
    return query.data === undefined ? <SuggestionLoading /> : <SuggestionResult suggestion={query.data} />;
}
