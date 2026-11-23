import { useEffect } from 'react';
import { track } from '@/shared/lib/analytics';
import type { SummaryCardStateName } from '@/shared/lib/analytics/events';
import type { SummaryKind } from '../types';

export function useTrackSummaryViewed(kind: SummaryKind, state: SummaryCardStateName): void {
    useEffect((): void => {
        track('summary_viewed', { kind, state });
    }, [kind, state]);
}
