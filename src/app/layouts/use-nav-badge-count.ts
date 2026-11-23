import { use } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useRecurringReviewCount } from '@/features/spending/recurring/api/use-recurring.query';
import { useUncategorizedCount } from '@/features/spending/api/use-uncategorized-count.query';
import type { UncategorizedCount } from '@/features/spending/types';
import { SampleDataContext, type SampleDataControls } from '@/shared/lib/sample-data/sample-data-context';
import type { NavBadge, NavItem } from './app-nav';

const UNCATEGORIZED_BADGE: NavBadge = 'spendingUncategorized';

export function useNavBadgeCount(items: readonly NavItem[]): number {
    const sample: SampleDataControls | null = use(SampleDataContext);
    const wanted: boolean = items.some((item: NavItem): boolean => item.badge === UNCATEGORIZED_BADGE) && sample?.active !== true;
    const count: UseQueryResult<UncategorizedCount> = useUncategorizedCount({ enabled: wanted });
    return wanted ? (count.data?.count ?? 0) : 0;
}

const REVIEW_BADGE: NavBadge = 'recurringReview';

export function useRecurringBadgeCount(items: readonly NavItem[]): number {
    const sample: SampleDataControls | null = use(SampleDataContext);
    const wanted: boolean = items.some((item: NavItem): boolean => item.badge === REVIEW_BADGE) && sample?.active !== true;
    const count: number | undefined = useRecurringReviewCount({ enabled: wanted });
    return wanted ? (count ?? 0) : 0;
}
