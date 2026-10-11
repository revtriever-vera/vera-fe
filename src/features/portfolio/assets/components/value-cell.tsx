import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Money } from '@/shared/ui/money';
import type { BaseCurrency, HoldingView } from '../../types';
import { hasUnreliableValue, holdingFlags, type HoldingFlag } from '../lib/holding-flags';

const FLAG_TONES: Readonly<Record<HoldingFlag, 'neutral' | 'caution'>> = {
    missing_quote: 'caution',
    stale: 'caution',
    estimated: 'neutral',
    matured: 'caution',
    missing_rate: 'caution'
};

function FlagChip({ flag, holding }: { readonly flag: HoldingFlag; readonly holding: HoldingView }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const stale: string =
        holding.priceDate === null ? t('flags.staleUnknown') : t('flags.stale', { date: formatIsoDate(holding.priceDate, locale) });
    const text: string = flag === 'stale' ? stale : t(`flags.${flag}`);
    return <Badge tone={FLAG_TONES[flag]}>{text}</Badge>;
}

export function FlagChips({ holding }: { readonly holding: HoldingView }): ReactElement | null {
    const flags: readonly HoldingFlag[] = holdingFlags(holding);
    if (flags.length === 0) {
        return null;
    }
    return (
        <span className="flex flex-wrap gap-1">
            {flags.map((flag: HoldingFlag): ReactElement => (
                <FlagChip key={flag} flag={flag} holding={holding} />
            ))}
        </span>
    );
}

export interface ValueCellProps {
    readonly holding: HoldingView;
    readonly baseCurrency: BaseCurrency;
}

export function ValueCell({ holding, baseCurrency }: ValueCellProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const unavailable: boolean = hasUnreliableValue(holding);
    const showNative: boolean = !unavailable && holding.nativeCurrency !== baseCurrency;
    return (
        <span className="flex flex-col gap-1">
            <span className="numeric font-semibold text-content">
                {unavailable ? t('valueUnavailable') : <Money amountMinor={holding.valueMinor} currency={baseCurrency} />}
            </span>
            {showNative ? (
                <span className="text-xs text-content-muted">
                    <Money amountMinor={holding.nativeValueMinor} currency={holding.nativeCurrency} />
                </span>
            ) : null}
            <FlagChips holding={holding} />
        </span>
    );
}
