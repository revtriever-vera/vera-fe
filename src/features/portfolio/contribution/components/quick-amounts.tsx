import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { majorToMinor } from '../lib/amount-minor';
import { QUICK_AMOUNTS } from '../lib/quick-amounts';
import type { BaseCurrency } from '../../types';

export interface QuickAmountsProps {
    readonly currency: BaseCurrency;
    readonly selectedMinor: number | null;
    readonly onSelect: (minor: number) => void;
}

function formatWhole(major: number, currency: string, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(major);
}

export function QuickAmounts({ currency, selectedMinor, onSelect }: QuickAmountsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const locale: SupportedLocale = useLocale();
    return (
        <div role="group" aria-label={t('amount.quickLabel')} className="grid grid-cols-2 gap-2 min-[560px]:flex min-[560px]:flex-wrap">
            {QUICK_AMOUNTS[currency].map((major: number): ReactElement => {
                const minor: number = majorToMinor(major, currency, locale);
                return (
                    <Button
                        key={major}
                        variant={selectedMinor === minor ? 'primary' : 'secondary'}
                        aria-pressed={selectedMinor === minor}
                        data-quick-amount={major}
                        onClick={(): void => {
                            onSelect(minor);
                        }}
                    >
                        {formatWhole(major, currency, locale)}
                    </Button>
                );
            })}
        </div>
    );
}
