import type { ReactElement } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import { CLASS_BAR_COLORS } from '../lib/class-bar-color';
import type { OverviewViewModel, ClassRow } from '../lib/overview-view-model';
import { StackedBar } from './stacked-bar';

export interface ActualVsTargetCardProps {
    readonly model: OverviewViewModel;
    readonly currency: string;
}

function BarRow({ label, children }: { readonly label: string; readonly children: ReactElement }): ReactElement {
    return (
        <div className="flex flex-col gap-1 min-[480px]:flex-row min-[480px]:items-center min-[480px]:gap-3">
            <span className="w-12 shrink-0 text-xs font-semibold text-content-muted">{label}</span>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

function Legend({ rows }: { readonly rows: readonly ClassRow[] }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const label: ClassLabel = useClassLabel();
    return (
        <ul aria-label={t('chart.legend')} className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-content-muted">
            {rows.map((row: ClassRow): ReactElement => (
                <li key={row.classId} className="flex items-center gap-1.5">
                    <span aria-hidden="true" className={cn('size-2.5 rounded-full', CLASS_BAR_COLORS[row.colorKey])} />
                    {label(row.systemKey, row.name)}
                </li>
            ))}
        </ul>
    );
}

export function ActualVsTargetCard({ model, currency }: ActualVsTargetCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    return (
        <section className="surface-card flex flex-col gap-4 p-5">
            <div>
                <h3 className="flex items-center gap-2 text-base font-semibold">
                    <SlidersHorizontal aria-hidden="true" className="size-4 text-accent-strong" />
                    {t('chart.title')}
                </h3>
                <p className="text-sm text-content-muted">{t('chart.hint')}</p>
            </div>
            <div className="flex flex-col gap-3">
                <BarRow label={t('chart.actual')}>
                    <StackedBar rows={model.rows} segments={model.actual} emphasis="actual" currency={currency} />
                </BarRow>
                <BarRow label={t('chart.target')}>
                    <StackedBar rows={model.rows} segments={model.target} emphasis="target" currency={currency} />
                </BarRow>
            </div>
            <Legend rows={model.rows} />
        </section>
    );
}
