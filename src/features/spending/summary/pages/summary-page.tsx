import { useState, type ReactElement } from 'react';
import { useNavigate, useSearch, type UseNavigateResult } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { IncomeModeDialog } from '../../components/income-mode-dialog';
import { SpendingEmptyState } from '../../components/spending-empty-state';
import type { MonthlySummary } from '../../types';
import { useSummary } from '../api/use-summary.query';
import { SpendingBars } from '../components/spending-bars';
import { SummaryHeader } from '../components/summary-header';
import { SummaryKpis } from '../components/summary-kpis';
import { SummaryNotes } from '../components/summary-notes';

const SKELETON_BARS: readonly number[] = [0, 1, 2, 3, 4, 5];

function SummaryLoading(): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    return (
        <Loading label={t('loading')} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 lg:grid-cols-4">
                {SKELETON_BARS.slice(0, 4).map((key: number): ReactElement => (
                    <Skeleton key={key} className="h-24 w-full" />
                ))}
            </div>
            <div className="flex flex-col gap-4">
                {SKELETON_BARS.map((key: number): ReactElement => (
                    <Skeleton key={key} className="h-8 w-full" />
                ))}
            </div>
        </Loading>
    );
}

function SummaryFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('retry')}
            </Button>
        </div>
    );
}

interface SummaryContentProps {
    readonly summary: MonthlySummary;
    readonly onMonthChange: (month: string) => void;
    readonly onChangeIncome: () => void;
}

function SummaryContent({ summary, onMonthChange, onChangeIncome }: SummaryContentProps): ReactElement {
    if (!summary.hasData) {
        return <SpendingEmptyState />;
    }
    return (
        <div className="flex flex-col gap-4">
            <SummaryHeader summary={summary} onMonthChange={onMonthChange} />
            <SummaryKpis summary={summary} onChangeIncome={onChangeIncome} />
            <SpendingBars summary={summary} />
            <SummaryNotes summary={summary} onChangeIncome={onChangeIncome} />
        </div>
    );
}

export function SummaryPage(): ReactElement {
    const search: { month?: string } = useSearch({ from: '/_auth/_app/spending/' });
    const navigate: UseNavigateResult<string> = useNavigate();
    const summary: UseQueryResult<MonthlySummary> = useSummary(search.month);
    const [incomeOpen, setIncomeOpen] = useState<boolean>(false);
    const goToMonth = (month: string): void => {
        void navigate({ to: '/spending', search: { month } });
    };
    const openIncome = (): void => {
        setIncomeOpen(true);
    };
    return (
        <section className="flex flex-col gap-4">
            {summary.data === undefined ? null : (
                <SummaryContent summary={summary.data} onMonthChange={goToMonth} onChangeIncome={openIncome} />
            )}
            {summary.data === undefined && summary.error === null ? <SummaryLoading /> : null}
            {summary.data === undefined && summary.error !== null ? (
                <SummaryFailure
                    error={summary.error}
                    onRetry={(): void => {
                        void summary.refetch();
                    }}
                />
            ) : null}
            <IncomeModeDialog open={incomeOpen} onOpenChange={setIncomeOpen} />
        </section>
    );
}
