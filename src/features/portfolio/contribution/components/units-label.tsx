import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { decimalPlaces } from '../../assets/lib/quantity-decimals';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { unitsLabelKey, type UnitsLabelKey } from '../lib/units-label-key';

export interface UnitsLabelProps {
    readonly typeGroup: string;
    readonly approxUnits: string | null;
}

function formatUnits(approxUnits: string, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: decimalPlaces(approxUnits) }).format(Number(approxUnits));
}

export function UnitsLabel({ typeGroup, approxUnits }: UnitsLabelProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const locale: SupportedLocale = useLocale();
    const key: UnitsLabelKey = unitsLabelKey(typeGroup, approxUnits);
    if (approxUnits === null) {
        return <span>{key === 'fixed_income' ? t('units.fixedIncome') : t('units.priceUnavailable')}</span>;
    }
    const value: string = formatUnits(approxUnits, locale);
    const count: number = Number(approxUnits);
    switch (key) {
        case 'less_than_one':
            return <span>{t('units.lessThanOne')}</span>;
        case 'units':
            return <span>{t('units.units', { value })}</span>;
        case 'bonds':
            return <span>{t('units.bonds', { value, count })}</span>;
        default:
            return <span>{t('units.shares', { value, count })}</span>;
    }
}
