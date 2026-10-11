import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { TransactionView } from '../../types';
import { AccountLabel } from './account-label';
import { TransactionAmount, TransactionCategory, TransactionDate, TransactionTitle } from './transaction-row';
import type { TransactionsListProps } from './transactions-table';

function TransactionCard({ transaction }: { readonly transaction: TransactionView }): ReactElement {
    return (
        <li className="surface-card flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <TransactionTitle transaction={transaction} />
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-content-muted">
                        <TransactionDate transaction={transaction} />
                        <AccountLabel transaction={transaction} />
                    </p>
                </div>
                <TransactionAmount transaction={transaction} />
            </div>
            <TransactionCategory transaction={transaction} />
        </li>
    );
}

export function TransactionsCardList({ transactions }: TransactionsListProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    return (
        <ul aria-label={t('list.cardsLabel')} className="flex flex-col gap-3">
            {transactions.map((transaction: TransactionView): ReactElement => (
                <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
        </ul>
    );
}
