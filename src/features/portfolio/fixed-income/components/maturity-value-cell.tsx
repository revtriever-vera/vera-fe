import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Money } from '@/shared/ui/money';
import { Balloon } from '@/shared/ui/tooltip';
import type { MaturitiesResponse, MaturityItem } from '../types';

export interface MaturityValueCellProps {
    readonly item: MaturityItem;
    readonly reference: MaturitiesResponse['reference'];
}

function useEstimateText(item: MaturityItem, reference: MaturitiesResponse['reference']): string {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const locale: SupportedLocale = useLocale();
    if (item.basis === 'cdi_projection' && reference.cdiDate !== null) {
        return t('maturities.estimatedCdi', { date: formatIsoDate(reference.cdiDate, locale) });
    }
    if (item.basis === 'ipca_projection' || item.basis === 'inflation_only') {
        return t('maturities.estimatedIpca');
    }
    return t('maturities.estimatedOther');
}

export function MaturityValueCell({ item, reference }: MaturityValueCellProps): ReactElement {
    const text: string = useEstimateText(item, reference);
    const money: ReactElement = <Money amountMinor={item.estimatedValueMinor} currency={item.currency} />;
    if (!item.estimated) {
        return money;
    }
    return (
        <Balloon text={text}>
            <button type="button" className="cursor-help rounded-control underline decoration-dotted underline-offset-4">
                {money}
            </button>
        </Balloon>
    );
}
