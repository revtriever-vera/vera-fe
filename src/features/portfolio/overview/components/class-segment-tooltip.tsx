import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatPpBps, formatShareBps, formatTargetBps } from '../../lib/format-bps';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import { CLASS_BAR_COLORS } from '../lib/class-bar-color';
import { gapSentence } from '../lib/gap-sentence';
import type { ClassRow } from '../lib/overview-view-model';

export type TooltipEmphasis = 'actual' | 'target' | 'both';

export interface ClassSegmentTooltipProps {
    readonly row: ClassRow;
    readonly emphasis: TooltipEmphasis;
    readonly currency: string;
}

export function ClassSegmentTooltip({ row, emphasis, currency }: ClassSegmentTooltipProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const locale: SupportedLocale = useLocale();
    const label: ClassLabel = useClassLabel();
    const money = (minor: number): string => formatCurrency(minor, currency, locale);
    const actual: string = t('tooltip.actual', { share: formatShareBps(row.shareBps, locale), value: money(row.valueMinor) });
    const target: string = t('tooltip.target', { share: formatTargetBps(row.targetBps, locale), value: money(row.targetValueMinor) });
    const lines: readonly string[] = emphasis === 'target' ? [target, actual] : [actual, target];
    return (
        <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 font-semibold">
                <span aria-hidden="true" className={cn('size-2 rounded-full', CLASS_BAR_COLORS[row.colorKey])} />
                {label(row.systemKey, row.name)}
            </span>
            <span className="font-semibold">{lines[0]}</span>
            <span>{lines[1]}</span>
            <span>{t('tooltip.deviation', { pp: formatPpBps(row.deviationBps, locale) })}</span>
            <span className="text-surface/80">{gapSentence(t, row.status, row.gapMinor, money)}</span>
        </div>
    );
}
