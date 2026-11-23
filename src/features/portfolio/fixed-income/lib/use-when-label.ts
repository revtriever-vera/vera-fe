import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { TIME_UNIT, timeToMaturity, type TimeToMaturity } from './time-to-maturity';

export function useWhenLabel(): (days: number) => string {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const locale: SupportedLocale = useLocale();
    return (days: number): string => {
        const time: TimeToMaturity = timeToMaturity(days);
        if (time.unit === TIME_UNIT.today) {
            return t('when.today');
        }
        if (time.unit === TIME_UNIT.days) {
            return t('when.days', { count: time.amount });
        }
        if (time.unit === TIME_UNIT.months) {
            return t('when.months', { count: time.amount });
        }
        return t('when.years', { years: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(time.amount) });
    };
}
