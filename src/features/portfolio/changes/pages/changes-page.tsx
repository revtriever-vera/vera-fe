import type { ReactElement } from 'react';
import { useNavigate, useSearch, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { HolderFilter } from '../../components/holder-filter';
import type { HolderParam } from '../../lib/holder-filter';
import { useHolderParam } from '../../lib/use-holder-param';
import { useChanges } from '../api/use-changes.query';
import { ChangeItemRow } from '../components/change-item-row';
import { ChangesLocked } from '../components/changes-locked';
import { ChangesNotice } from '../components/changes-notice';
import { changesLockOf } from '../lib/locked-count';
import { changesWindowSchema } from '../schemas/changes-window.schema';
import { CHANGES_WINDOWS, type ChangeItem, type ChangesWindow } from '../types';

const DEFAULT_WINDOW: ChangesWindow = '7';

function useWindow(): ChangesWindow {
    return useSearch({
        strict: false,
        select: (search: Record<string, unknown>): ChangesWindow => changesWindowSchema.parse(search.days) ?? DEFAULT_WINDOW
    });
}

function WindowFilter({ value }: { readonly value: ChangesWindow }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioChanges', undefined> = useTranslation('portfolioChanges');
    const navigate: UseNavigateResult<string> = useNavigate();
    const options: readonly SegmentedOption<ChangesWindow>[] = CHANGES_WINDOWS.map(
        (days: ChangesWindow): SegmentedOption<ChangesWindow> => ({ value: days, label: t(`window.${days}`) })
    );
    return (
        <SegmentedControl
            label={t('window.label')}
            options={options}
            value={value}
            onChange={(next: ChangesWindow): void => {
                void navigate({
                    to: '.',
                    search: (previous: Record<string, unknown>): Record<string, unknown> => ({
                        ...previous,
                        days: next === DEFAULT_WINDOW ? undefined : next
                    }),
                    replace: true
                });
            }}
        />
    );
}

function ChangesHeader({ days }: { readonly days: ChangesWindow }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioChanges', undefined> = useTranslation('portfolioChanges');
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 className="text-xl font-extrabold">{t('title')}</h2>
                <p className="text-sm text-content-muted">{t('subtitle')}</p>
            </div>
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
                <HolderFilter />
                <WindowFilter value={days} />
            </div>
        </div>
    );
}

function ChangesLoading(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioChanges', undefined> = useTranslation('portfolioChanges');
    return (
        <Loading label={t('loading')} className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </Loading>
    );
}

function ChangesFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioChanges', undefined> = useTranslation('portfolioChanges');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('retry')}
            </Button>
        </div>
    );
}

function ChangesEmpty({ days }: { readonly days: ChangesWindow }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioChanges', undefined> = useTranslation('portfolioChanges');
    return (
        <output className="block rounded-card border border-dashed border-border p-6 text-center text-sm text-content-muted">
            {t(`empty.${days}`)}
        </output>
    );
}

function ChangesBody({ days }: { readonly days: ChangesWindow }): ReactElement {
    const holder: HolderParam = useHolderParam();
    const changes: ReturnType<typeof useChanges> = useChanges(days, holder);
    const lock: ReturnType<typeof changesLockOf> = changesLockOf(changes.error);
    if (lock !== null) {
        return <ChangesLocked lock={lock} />;
    }
    if (changes.data === undefined) {
        return changes.error === null ? (
            <ChangesLoading />
        ) : (
            <ChangesFailure
                error={changes.error}
                onRetry={(): void => {
                    void changes.refetch();
                }}
            />
        );
    }
    if (changes.data.items.length === 0) {
        return <ChangesEmpty days={days} />;
    }
    return (
        <Card className="flex flex-col gap-2">
            <ul className="flex flex-col divide-y divide-border">
                {changes.data.items.map((item: ChangeItem): ReactElement => (
                    <ChangeItemRow key={item.id} item={item} />
                ))}
            </ul>
        </Card>
    );
}

export function ChangesPage(): ReactElement {
    const days: ChangesWindow = useWindow();
    return (
        <section className="flex flex-col gap-4">
            <ChangesHeader days={days} />
            <ChangesBody days={days} />
            <ChangesNotice />
        </section>
    );
}
