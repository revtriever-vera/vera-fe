import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { Plus, Wallet } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button, buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useOverview } from '../../api/use-overview.query';
import { BaseCurrencySwitch } from '../../components/base-currency-switch';
import { DataSourcesNote } from '../../components/data-sources-note';
import type { Overview } from '../../types';
import { ActualVsTargetCard } from '../components/actual-vs-target-card';
import { ClassCardList } from '../components/class-card-list';
import { ClassTable } from '../components/class-table';
import { QualityNotice } from '../components/quality-notice';
import { TotalCard } from '../components/total-card';
import { buildOverviewViewModel, type OverviewViewModel } from '../lib/overview-view-model';

const BPS_PER_POINT: number = 100;

function OverviewHeader(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 className="text-xl font-extrabold">{t('title')}</h2>
                <p className="text-sm text-content-muted">{t('subtitle')}</p>
            </div>
            <BaseCurrencySwitch />
        </div>
    );
}

function OverviewLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    return (
        <Loading label={t('loading')} className="flex flex-col gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-52 w-full" />
                <Skeleton className="h-52 w-full" />
            </div>
            <Skeleton className="h-80 w-full" />
        </Loading>
    );
}

function OverviewFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('retry')}
            </Button>
        </div>
    );
}

function OverviewEmpty(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    return (
        <EmptyState
            icon={<Wallet className="size-6" />}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
                <Link to="/patrimonio/comecar" className={buttonVariants()}>
                    <Plus aria-hidden="true" className="size-4" />
                    {t('empty.action')}
                </Link>
            }
        />
    );
}

function DistributionCard({ model, overview }: { readonly model: OverviewViewModel; readonly overview: Overview }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const locale: SupportedLocale = useLocale();
    const tolerance: string = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(overview.toleranceBps / BPS_PER_POINT);
    return (
        <section className="flex flex-col gap-3">
            <div>
                <h3 className="text-base font-semibold">{t('table.title')}</h3>
                <p className="text-sm text-content-muted">{t('table.hint', { tolerance })}</p>
            </div>
            <div className="hidden sm:block">
                <ClassTable rows={model.rows} currency={overview.baseCurrency} />
            </div>
            <div className="sm:hidden">
                <ClassCardList rows={model.rows} />
            </div>
        </section>
    );
}

function OverviewContent({ overview }: { readonly overview: Overview }): ReactElement {
    const model: OverviewViewModel = buildOverviewViewModel(overview);
    return (
        <div className="flex flex-col gap-4">
            <div className="grid items-start gap-4 lg:grid-cols-2">
                <TotalCard overview={overview} callout={model.callout} />
                <ActualVsTargetCard model={model} currency={overview.baseCurrency} />
            </div>
            <QualityNotice quality={overview.quality} />
            <DistributionCard model={model} overview={overview} />
        </div>
    );
}

function OverviewBody(): ReactElement {
    const overview: UseQueryResult<Overview> = useOverview();
    if (overview.data !== undefined) {
        return overview.data.empty ? <OverviewEmpty /> : <OverviewContent overview={overview.data} />;
    }
    if (overview.error !== null) {
        return (
            <OverviewFailure
                error={overview.error}
                onRetry={(): void => {
                    void overview.refetch();
                }}
            />
        );
    }
    return <OverviewLoading />;
}

export function OverviewPage(): ReactElement {
    return (
        <section className="flex flex-col gap-4">
            <OverviewHeader />
            <OverviewBody />
            <DataSourcesNote />
        </section>
    );
}
