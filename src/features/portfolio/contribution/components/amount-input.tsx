import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { currencySymbol } from '@/shared/lib/format/money-input';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { MoneyInput } from '@/shared/ui/money-input';
import type { BaseCurrency } from '../../types';
import { QuickAmounts } from './quick-amounts';

export interface AmountInputProps {
    readonly value: number | null;
    readonly currency: BaseCurrency;
    readonly onChange: (minor: number | null) => void;
}

export function AmountInput({ value, currency, onChange }: AmountInputProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="flex max-w-xl flex-col gap-3">
            <MoneyInput
                label={t('amount.label', { currency: currencySymbol(currency, locale) })}
                value={value}
                currency={currency}
                onChange={onChange}
            />
            <QuickAmounts currency={currency} selectedMinor={value} onSelect={onChange} />
        </div>
    );
}
