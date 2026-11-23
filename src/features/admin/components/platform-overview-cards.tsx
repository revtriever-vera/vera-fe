import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { CreditCard, Gift, UserPlus, Users, type LucideIcon } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { KpiTile } from '@/shared/ui/kpi';
import { Skeleton } from '@/shared/ui/skeleton';
import { usePlatformOverview } from '../api/use-platform-overview.query';
import { platformRefusal } from '../lib/platform-refusal';
import type { PlatformOverview } from '../types';

interface Tile {
    readonly label: 'overviewAccounts' | 'overviewNew' | 'overviewFree' | 'overviewPremium' | 'overviewTrials';
    readonly icon: LucideIcon;
    readonly value: (overview: PlatformOverview) => number;
}

const TILES: readonly Tile[] = [
    { label: 'overviewAccounts', icon: Users, value: (overview: PlatformOverview): number => overview.accounts.total },
    { label: 'overviewNew', icon: UserPlus, value: (overview: PlatformOverview): number => overview.accounts.createdLast30Days },
    { label: 'overviewFree', icon: Users, value: (overview: PlatformOverview): number => overview.plans.free },
    { label: 'overviewPremium', icon: CreditCard, value: (overview: PlatformOverview): number => overview.plans.premium },
    { label: 'overviewTrials', icon: Gift, value: (overview: PlatformOverview): number => overview.plans.trials }
];

export function PlatformOverviewCards(): ReactElement | null {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const overview: UseQueryResult<PlatformOverview> = usePlatformOverview();
    if (overview.isError) {
        return platformRefusal(overview.error) === null ? <FailureAlert error={overview.error} title={t('overviewLoadError')} /> : null;
    }
    return (
        <section aria-label={t('overviewTitle')} className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {TILES.map((tile: Tile): ReactElement => (
                <KpiTile
                    key={tile.label}
                    label={t(tile.label)}
                    icon={tile.icon}
                    value={overview.data === undefined ? <Skeleton className="h-7 w-12" /> : tile.value(overview.data)}
                />
            ))}
        </section>
    );
}
