import type { ReactElement } from 'react';
import { BaseCurrencySwitch } from '@/features/portfolio/components/base-currency-switch';
import { ClassTile } from '@/features/portfolio/components/class-tile';
import { DataSourcesNote } from '@/features/portfolio/components/data-sources-note';
import { StatusChip } from '@/features/portfolio/components/status-chip';
import { CLASS_COLOR_KEYS, SYSTEM_CLASS_KEYS } from '@/features/portfolio/types';

const SYSTEM_KEYS: readonly (string | null)[] = [...Object.values(SYSTEM_CLASS_KEYS), null, null, null, null];

export function PortfolioShowcase(): ReactElement {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Patrimônio</h2>
            <div className="flex flex-wrap items-center gap-3">
                {CLASS_COLOR_KEYS.map((colorKey, index): ReactElement => (
                    <ClassTile key={colorKey} systemKey={SYSTEM_KEYS[index] ?? null} colorKey={colorKey} />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <StatusChip status="within" deviationBps={82} />
                <StatusChip status="above" deviationBps={361} />
                <StatusChip status="below" deviationBps={-472} />
                <BaseCurrencySwitch />
            </div>
            <DataSourcesNote />
        </section>
    );
}
