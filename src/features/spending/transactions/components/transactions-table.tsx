import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Table, type TableColumn } from '@/shared/ui/table';
import type { TransactionView } from '../../types';
import { TransactionAmount, TransactionCategory, TransactionDate, TransactionTitle } from './transaction-row';

export interface TransactionsListProps {
    readonly transactions: readonly TransactionView[];
}

const MIN_WIDTH: string = 'min-w-[56rem]';

export function TransactionsTable({ transactions }: TransactionsListProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const columns: readonly TableColumn<TransactionView>[] = [
        {
            key: 'date',
            header: t('columns.date'),
            render: (transaction: TransactionView): ReactElement => <TransactionDate transaction={transaction} />
        },
        {
            key: 'description',
            header: t('columns.description'),
            render: (transaction: TransactionView): ReactElement => <TransactionTitle transaction={transaction} />
        },
        {
            key: 'category',
            header: t('columns.category'),
            render: (transaction: TransactionView): ReactElement => <TransactionCategory transaction={transaction} />
        },
        { key: 'account', header: t('columns.account'), render: (transaction: TransactionView): string => transaction.accountName },
        {
            key: 'amount',
            header: t('columns.amount'),
            align: 'right',
            render: (transaction: TransactionView): ReactElement => <TransactionAmount transaction={transaction} />
        }
    ];
    return (
        <Table
            label={t('list.tableLabel')}
            columns={columns}
            rows={transactions}
            rowKey={(transaction: TransactionView): string => transaction.id}
            minWidthClass={MIN_WIDTH}
        />
    );
}
