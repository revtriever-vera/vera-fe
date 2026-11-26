import { useMemo, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Button } from '@/shared/ui/button';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { HolderFilter } from '../../components/holder-filter';
import type { HolderParam } from '../../lib/holder-filter';
import { useHolderParam } from '../../lib/use-holder-param';
import { useAgenda } from '../api/use-agenda.query';
import { AgendaKindFilter } from '../components/agenda-kind-filter';
import { AgendaWeekSection } from '../components/agenda-week-section';
import { applyAgendaFilter } from '../lib/agenda-filter';
import { agendaWindow, type AgendaWindow } from '../lib/agenda-window';
import { useAgendaFilter } from '../lib/use-agenda-filter';
import { groupByWeek, type AgendaWeek } from '../lib/agenda-weeks';
import type { AgendaFilter, AgendaItem, AgendaResponse } from '../types';

function AgendaHeader({ filter }: { readonly filter: AgendaFilter | undefined }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 className="text-xl font-extrabold">{t('title')}</h2>
                <p className="text-sm text-content-muted">{t('subtitle')}</p>
            </div>
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                <HolderFilter />
                <AgendaKindFilter value={filter} />
            </div>
        </div>
    );
}

function AgendaLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    return (
        <Loading label={t('loading')} className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </Loading>
    );
}

function AgendaFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('retry')}
            </Button>
        </div>
    );
}

function AgendaEmpty({ filtered }: { readonly filtered: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    return (
        <output className="block rounded-card border border-dashed border-border p-6 text-center text-sm text-content-muted">
            {filtered ? t('emptyFiltered') : t('empty')}
        </output>
    );
}

function AgendaBody({ filter }: { readonly filter: AgendaFilter | undefined }): ReactElement {
    const holder: HolderParam = useHolderParam();
    const range: AgendaWindow = useMemo((): AgendaWindow => agendaWindow(new Date()), []);
    const agenda: UseQueryResult<AgendaResponse> = useAgenda(range.from, range.to, holder);
    if (agenda.data === undefined) {
        return agenda.error === null ? (
            <AgendaLoading />
        ) : (
            <AgendaFailure
                error={agenda.error}
                onRetry={(): void => {
                    void agenda.refetch();
                }}
            />
        );
    }
    const items: readonly AgendaItem[] = applyAgendaFilter(agenda.data.items, filter);
    if (items.length === 0) {
        return <AgendaEmpty filtered={filter !== undefined || holder !== undefined} />;
    }
    return (
        <div className="flex flex-col gap-4">
            {groupByWeek(items).map((week: AgendaWeek): ReactElement => (
                <AgendaWeekSection key={week.start} week={week} />
            ))}
        </div>
    );
}

export function AgendaPage(): ReactElement {
    const filter: AgendaFilter | undefined = useAgendaFilter();
    return (
        <section className="flex flex-col gap-4">
            <AgendaHeader filter={filter} />
            <AgendaBody filter={filter} />
        </section>
    );
}
