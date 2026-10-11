import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { RichBalloon } from '@/shared/ui/tooltip';
import { formatShareBps, formatTargetBps } from '../../lib/format-bps';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import { CLASS_BAR_COLORS } from '../lib/class-bar-color';
import { percentStyle } from '../lib/percent-style';
import type { ClassRow, ClassSegment } from '../lib/overview-view-model';
import { ClassSegmentTooltip, type TooltipEmphasis } from './class-segment-tooltip';

export interface StackedBarProps {
    readonly rows: readonly ClassRow[];
    readonly segments: readonly ClassSegment[];
    readonly emphasis: Exclude<TooltipEmphasis, 'both'>;
    readonly currency: string;
}

export function StackedBar({ rows, segments, emphasis, currency }: StackedBarProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const locale: SupportedLocale = useLocale();
    const label: ClassLabel = useClassLabel();
    return (
        <div className={cn('flex h-9 w-full overflow-hidden rounded-control bg-surface-muted', emphasis === 'target' && 'opacity-75')}>
            {segments.map((segment: ClassSegment, index: number): ReactElement | null => {
                const row: ClassRow | undefined = rows[index];
                if (row === undefined || segment.widthPercent <= 0) {
                    return null;
                }
                const name: string = label(row.systemKey, row.name);
                const summary: string = t('chart.segmentLabel', {
                    name,
                    actual: formatShareBps(row.shareBps, locale),
                    target: formatTargetBps(row.targetBps, locale)
                });
                return (
                    <RichBalloon key={segment.classId} content={<ClassSegmentTooltip row={row} emphasis={emphasis} currency={currency} />}>
                        <button
                            type="button"
                            aria-label={summary}
                            style={{ width: percentStyle(segment.widthPercent) }}
                            className={cn(
                                'h-full min-w-0 shrink-0 border-r border-surface last:border-r-0',
                                CLASS_BAR_COLORS[segment.colorKey]
                            )}
                        />
                    </RichBalloon>
                );
            })}
        </div>
    );
}
