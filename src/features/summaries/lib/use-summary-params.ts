import { useState } from 'react';
import { useSession } from '@/app/providers/session-provider';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { readContributionMinor } from '@/shared/lib/contribution-amount-store';
import { SUMMARY_KIND, type SummaryKind, type SummaryParams } from '../types';

const GOAL_SETTLE_MS: number = 800;

function rememberedContribution(kind: SummaryKind, companyId: string | undefined): number | undefined {
    return kind === SUMMARY_KIND.portfolio && companyId !== undefined ? readContributionMinor(companyId) : undefined;
}

export function useSummaryParams(kind: SummaryKind, month: string | undefined, goalBps: number | undefined): SummaryParams {
    const { user } = useSession();
    const settledGoalBps: number | undefined = useDebouncedValue(goalBps, GOAL_SETTLE_MS);
    const [contributionMinor] = useState<number | undefined>((): number | undefined => rememberedContribution(kind, user?.companyId));
    if (kind === SUMMARY_KIND.month) {
        return month === undefined ? {} : { month };
    }
    if (kind === SUMMARY_KIND.cuts) {
        return { ...(month === undefined ? {} : { month }), ...(settledGoalBps === undefined ? {} : { goalBps: settledGoalBps }) };
    }
    return contributionMinor === undefined ? {} : { contributionMinor };
}
