import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { AVERAGE_MARK, BAR_FILL } from '../lib/bar-colors';

interface LegendItemProps {
    readonly swatchClass: string;
    readonly label: string;
}

function LegendItem({ swatchClass, label }: LegendItemProps): ReactElement {
    return (
        <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn('inline-block h-2.5 w-4 rounded-full', swatchClass)} />
            {label}
        </li>
    );
}

export function BarsLegend(): ReactElement {
    const { t }: UseTranslationResponse<'spendingSummary', undefined> = useTranslation('spendingSummary');
    return (
        <ul aria-label={t('legend.label')} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-muted">
            <LegendItem swatchClass={BAR_FILL.flexible} label={t('legend.flexible')} />
            <LegendItem swatchClass={BAR_FILL.fixed} label={t('legend.fixed')} />
            <LegendItem swatchClass={BAR_FILL.uncategorized} label={t('legend.uncategorized')} />
            <LegendItem swatchClass={AVERAGE_MARK} label={t('legend.average')} />
        </ul>
    );
}
