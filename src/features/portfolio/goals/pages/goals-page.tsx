import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { HolderFilter } from '../../components/holder-filter';
import type { HolderParam } from '../../lib/holder-filter';
import { useHolderParam } from '../../lib/use-holder-param';
import { useGoals } from '../api/use-goals.query';
import { CreateGoalLink } from '../components/create-goal-link';
import { GoalCard } from '../components/goal-card';
import { GoalsEmpty } from '../components/goals-empty';
import { GoalsKpis } from '../components/goals-kpis';
import { GOAL_KIND, type GoalsList, type GoalView } from '../types';

function GoalsHeader(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const { canEdit } = useRole();
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 className="text-xl font-extrabold">{t('title')}</h2>
                <p className="text-sm text-content-muted">{t('subtitle')}</p>
            </div>
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                <HolderFilter />
                {canEdit ? <CreateGoalLink kind={GOAL_KIND.other} label={t('create.header')} withIcon /> : null}
            </div>
        </div>
    );
}

function GoalsLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    return (
        <Loading label={t('loading')} className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
        </Loading>
    );
}

function GoalsFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('retry')}
            </Button>
        </div>
    );
}

function GoalsContent({ list }: { readonly list: GoalsList }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    return (
        <div className="flex flex-col gap-4">
            <GoalsKpis totals={list.totals} />
            <ul aria-label={t('listLabel')} className="grid items-start gap-4 lg:grid-cols-2">
                {list.items.map((goal: GoalView): ReactElement => (
                    <GoalCard key={goal.id} goal={goal} />
                ))}
            </ul>
        </div>
    );
}

function GoalsBody(): ReactElement {
    const holder: HolderParam = useHolderParam();
    const goals: UseQueryResult<GoalsList> = useGoals(holder);
    if (goals.data !== undefined) {
        return goals.data.items.length === 0 ? <GoalsEmpty filtered={holder !== undefined} /> : <GoalsContent list={goals.data} />;
    }
    if (goals.error !== null) {
        return (
            <GoalsFailure
                error={goals.error}
                onRetry={(): void => {
                    void goals.refetch();
                }}
            />
        );
    }
    return <GoalsLoading />;
}

export function GoalsPage(): ReactElement {
    return (
        <section className="flex flex-col gap-4">
            <GoalsHeader />
            <GoalsBody />
        </section>
    );
}
