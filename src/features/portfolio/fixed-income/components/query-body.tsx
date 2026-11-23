import type { ReactElement, ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';

export interface QueryBodyProps<Data> {
    readonly query: UseQueryResult<Data>;
    readonly loadingLabel: string;
    readonly children: (data: Data) => ReactNode;
}

export function QueryBody<Data>({ query, loadingLabel, children }: QueryBodyProps<Data>): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    if (query.data !== undefined) {
        return <>{children(query.data)}</>;
    }
    if (query.error !== null) {
        return (
            <div className="flex flex-col items-start gap-3">
                <FailureAlert error={query.error} title={t('common.loadError')} />
                <Button
                    variant="secondary"
                    onClick={(): void => {
                        void query.refetch();
                    }}
                >
                    {t('common.retry')}
                </Button>
            </div>
        );
    }
    return (
        <Loading label={loadingLabel} className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </Loading>
    );
}
