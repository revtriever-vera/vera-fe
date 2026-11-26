import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { Money } from '@/shared/ui/money';
import type { MonthlyReview } from '../types';

export function IncomeSection({ review }: { readonly review: MonthlyReview }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const { amountMinor, source }: MonthlyReview['income'] = review.income;
    return (
        <Card className="flex flex-col gap-1">
            <h3 className="text-base font-semibold">{t('income.title')}</h3>
            {amountMinor === 0 ? (
                <p className="text-sm text-content-muted">{t('income.none')}</p>
            ) : (
                <>
                    <Money amountMinor={amountMinor} currency={review.baseCurrency} className="numeric text-2xl font-bold" />
                    <p className="text-sm text-content-muted">{t(`income.${source}`)}</p>
                </>
            )}
        </Card>
    );
}
