import type { ReactElement } from 'react';
import { Info } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatTargetBps } from '../../lib/format-bps';
import { toleranceRange, type ToleranceRange } from '../lib/tolerance-range';

export interface ToleranceExampleProps {
    readonly toleranceBps: number;
}

const EXAMPLE_TARGET_BPS: number = 2000;
const BPS_PER_POINT: number = 100;

export function ToleranceExample({ toleranceBps }: ToleranceExampleProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const range: ToleranceRange = toleranceRange(EXAMPLE_TARGET_BPS, toleranceBps);
    const text: string = t('tolerance.example', {
        target: formatTargetBps(EXAMPLE_TARGET_BPS, locale),
        tolerance: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(toleranceBps / BPS_PER_POINT),
        lower: formatTargetBps(range.lowerBps, locale),
        upper: formatTargetBps(range.upperBps, locale)
    });
    return (
        <p className="flex items-start gap-2 rounded-control bg-surface-muted p-3 text-sm text-content-muted">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{text}</span>
        </p>
    );
}
