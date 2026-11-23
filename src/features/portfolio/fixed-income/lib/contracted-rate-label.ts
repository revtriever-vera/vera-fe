import type { TFunction } from 'i18next';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatTargetBps } from '../../lib/format-bps';
import type { RealRateItem } from '../types';

export function contractedRateLabel(t: TFunction<'portfolioFixedIncome'>, item: RealRateItem, locale: SupportedLocale): string {
    const rate: string = formatTargetBps(item.rateBps, locale);
    if (item.indexer === 'cdi_percent') {
        return t('realRate.contracted.cdi_percent', { rate });
    }
    if (item.indexer === 'prefixed') {
        return t('realRate.contracted.prefixed', { rate });
    }
    return t('realRate.contracted.ipca_plus', { rate });
}
