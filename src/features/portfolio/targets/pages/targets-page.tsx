import { useState, type ReactElement } from 'react';
import { useQueryClient, type QueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Button } from '@/shared/ui/button';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { invalidatePortfolio } from '../../api/invalidate-portfolio';
import { useClasses } from '../../api/use-classes.query';
import { useOverview } from '../../api/use-overview.query';
import { usePortfolioSettings } from '../../api/use-portfolio-settings.query';
import type { ClassesResponse, Overview, PortfolioSettings } from '../../types';
import { ClassManagerDialog } from '../components/class-manager-dialog';
import { ClassTargetsCard } from '../components/class-targets-card';
import { ManageClassesCard } from '../components/manage-classes-card';
import { ToleranceCard } from '../components/tolerance-card';

function TargetsLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <Loading label={t('targets.loading')} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Skeleton className="h-96 w-full" />
            <div className="flex flex-col gap-4">
                <Skeleton className="h-44 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </Loading>
    );
}

function TargetsFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('targets.loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('targets.retry')}
            </Button>
        </div>
    );
}

interface ContentProps {
    readonly classes: ClassesResponse;
    readonly settings: PortfolioSettings;
    readonly overview: Overview | undefined;
    readonly onManage: () => void;
}

function TargetsContent({ classes, settings, overview, onManage }: ContentProps): ReactElement {
    return (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <ClassTargetsCard classes={classes.data} overview={overview} />
            <div className="flex flex-col gap-4">
                <ToleranceCard key={settings.toleranceBps} toleranceBps={settings.toleranceBps} />
                <ManageClassesCard onOpen={onManage} />
            </div>
        </div>
    );
}

function TargetsBody({ onManage }: { readonly onManage: () => void }): ReactElement {
    const classes: UseQueryResult<ClassesResponse> = useClasses();
    const settings: UseQueryResult<PortfolioSettings> = usePortfolioSettings();
    const overview: UseQueryResult<Overview> = useOverview();
    const failure: Error | null = classes.error ?? settings.error;
    if (failure !== null) {
        return (
            <TargetsFailure
                error={failure}
                onRetry={(): void => {
                    void classes.refetch();
                    void settings.refetch();
                }}
            />
        );
    }
    if (classes.data === undefined || settings.data === undefined || overview.isPending) {
        return <TargetsLoading />;
    }
    return <TargetsContent classes={classes.data} settings={settings.data} overview={overview.data} onManage={onManage} />;
}

export function TargetsPage(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const queryClient: QueryClient = useQueryClient();
    const [managing, setManaging] = useState<boolean>(false);
    return (
        <section className="flex flex-col gap-4">
            <div>
                <h2 className="text-xl font-extrabold">{t('title')}</h2>
                <p className="text-sm text-content-muted">{t('subtitle')}</p>
            </div>
            <TargetsBody
                onManage={(): void => {
                    setManaging(true);
                }}
            />
            <ClassManagerDialog
                open={managing}
                onOpenChange={(open: boolean): void => {
                    setManaging(open);
                    if (!open) {
                        void invalidatePortfolio(queryClient);
                    }
                }}
            />
        </section>
    );
}
