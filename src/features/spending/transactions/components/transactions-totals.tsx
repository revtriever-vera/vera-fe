import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Pager } from '@/shared/ui/pager';
import { SignedAmount } from '../../components/signed-amount';
import { SPENDING_CURRENCY, type TransactionsResponse } from '../../types';

export interface TransactionsTotalsProps {
    readonly response: TransactionsResponse;
    readonly onPageChange: (page: number) => void;
}

export function TransactionsTotals({ response, onPageChange }: TransactionsTotalsProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const currency: string = response.data[0]?.currency ?? SPENDING_CURRENCY;
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <dl aria-label={t('totals.label')} className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <div className="flex gap-1.5">
                    <dt className="text-content-muted">{t('totals.in')}</dt>
                    <dd>
                        <SignedAmount amountMinor={Math.abs(response.totals.inMinor)} currency={currency} />
                    </dd>
                </div>
                <div className="flex gap-1.5">
                    <dt className="text-content-muted">{t('totals.out')}</dt>
                    <dd>
                        <SignedAmount amountMinor={-Math.abs(response.totals.outMinor)} currency={currency} />
                    </dd>
                </div>
                <div>{t('totals.count', { count: response.totals.count })}</div>
            </dl>
            <Pager page={response.pagination.page} totalPages={response.pagination.totalPages} onChange={onPageChange} />
        </div>
    );
}
