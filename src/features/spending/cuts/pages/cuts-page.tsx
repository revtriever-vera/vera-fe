import { useEffect, useRef, type ReactElement } from 'react';
import { useSearch } from '@tanstack/react-router';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { useUnsavedGuard, type UnsavedGuard } from '@/shared/lib/use-unsaved-guard';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useSpendingSettings } from '../../api/use-spending-settings.query';
import { SpendingEmptyState } from '../../components/spending-empty-state';
import type { CutsResponse, SpendingSettings } from '../../types';
import { useCuts } from '../api/use-cuts.query';
import { CutsStatusCard } from '../components/cuts-status-card';
import { CutsSuggestions } from '../components/cuts-suggestions';
import { GoalCard } from '../components/goal-card';
import { UncategorizedNote } from '../components/uncategorized-note';
import { UnsavedDialog } from '../components/unsaved-dialog';
import { useGoalDraft, type GoalDraftControls } from '../lib/goal-draft';

const DEBOUNCE_MS: number = 250;

function useTrackViewed(cuts: CutsResponse | undefined, placeholder: boolean): void {
    const tracked: { current: string | null } = useRef<string | null>(null);
    useEffect((): void => {
        if (cuts === undefined || placeholder || cuts.goal.simulated || tracked.current === cuts.month) {
            return;
        }
        tracked.current = cuts.month;
        track('spending_cuts_viewed', { status: cuts.status });
    }, [cuts, placeholder]);
}

function CutsBody({
    cuts,
    draft,
    busy
}: {
    readonly cuts: CutsResponse;
    readonly draft: GoalDraftControls;
    readonly busy: boolean;
}): ReactElement {
    if (cuts.status === 'no_data') {
        return <SpendingEmptyState />;
    }
    return (
        <div aria-busy={busy} className="flex flex-col gap-4">
            {cuts.status === 'no_income' ? null : <GoalCard cuts={cuts} draft={draft} />}
            <CutsStatusCard cuts={cuts} />
            <CutsSuggestions cuts={cuts} />
            <UncategorizedNote cuts={cuts} />
        </div>
    );
}

function CutsLoading(): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    return (
        <Loading label={t('page.loading')} className="flex flex-col gap-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-64 w-full" />
        </Loading>
    );
}

export function CutsPage(): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const search: { month?: string } = useSearch({ from: '/_auth/_app/spending/cuts' });
    const settings: UseQueryResult<SpendingSettings> = useSpendingSettings();
    const draft: GoalDraftControls = useGoalDraft(settings.data?.savingsGoalBps);
    const requestedBps: number | null = useDebouncedValue(draft.dirty ? draft.draftBps : null, DEBOUNCE_MS);
    const cuts: UseQueryResult<CutsResponse> = useCuts(search.month ?? null, requestedBps);
    const guard: UnsavedGuard = useUnsavedGuard(draft.dirty);
    useTrackViewed(cuts.data, cuts.isPlaceholderData);
    const failure: Error | null = cuts.error ?? settings.error;
    return (
        <section className="flex flex-col gap-4">
            {failure === null ? null : <FailureAlert error={failure} title={t('page.loadFailed')} />}
            {cuts.data === undefined || settings.data === undefined ? (
                failure === null ? (
                    <CutsLoading />
                ) : null
            ) : (
                <CutsBody cuts={cuts.data} draft={draft} busy={cuts.isPlaceholderData} />
            )}
            <UnsavedDialog guard={guard} />
        </section>
    );
}
