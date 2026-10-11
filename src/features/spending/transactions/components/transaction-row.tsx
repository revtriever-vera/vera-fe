import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { useLocale } from '@/shared/lib/i18n';
import { formatIsoDate } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { useCategories } from '../../api/use-categories.query';
import { CategorySourceBadge } from '../../components/category-source-badge';
import { CategoryTile } from '../../components/category-tile';
import { SignedAmount } from '../../components/signed-amount';
import { useCategoryLabel, type CategoryLabel } from '../../lib/use-category-label';
import type { CategoriesResponse, CategoryView, TransactionView } from '../../types';
import { transactionTitle } from '../lib/transaction-label';
import { InlineCategorize } from './inline-categorize';
import { RecategorizeDialog } from './recategorize-dialog';

export interface TransactionProps {
    readonly transaction: TransactionView;
}

export function TransactionDate({ transaction }: TransactionProps): ReactElement {
    const locale: SupportedLocale = useLocale();
    return <time dateTime={transaction.date}>{formatIsoDate(transaction.date, locale)}</time>;
}

export function TransactionTitle({ transaction }: TransactionProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    return (
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 font-medium break-words">{transactionTitle(transaction)}</span>
            {transaction.installment === null ? null : (
                <Badge>{t('row.installment', { number: transaction.installment.number, total: transaction.installment.total })}</Badge>
            )}
            {transaction.isSample ? <Badge tone="accent">{t('row.sample')}</Badge> : null}
        </div>
    );
}

export function TransactionAmount({ transaction }: TransactionProps): ReactElement {
    return <SignedAmount amountMinor={transaction.amountMinor} currency={transaction.currency} />;
}

function CategorizedCell({ transaction }: TransactionProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const labelOf: CategoryLabel = useCategoryLabel();
    const categories: UseQueryResult<CategoriesResponse> = useCategories();
    const [open, setOpen] = useState<boolean>(false);
    const category: CategoryView | null =
        categories.data?.categories.find((item: CategoryView): boolean => item.id === transaction.categoryId) ?? null;
    return (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
                type="button"
                aria-haspopup="dialog"
                aria-label={t('row.changeCategory', { category: labelOf(category), description: transactionTitle(transaction) })}
                onClick={(): void => {
                    setOpen(true);
                }}
                className="flex min-w-0 items-center gap-2 rounded-control text-left hover:bg-surface-muted"
            >
                <CategoryTile category={category} size="sm" />
                <span className="min-w-0 break-words">{labelOf(category)}</span>
            </button>
            <CategorySourceBadge source={transaction.categorySource} />
            {open ? (
                <RecategorizeDialog
                    transaction={transaction}
                    onClose={(): void => {
                        setOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}

export function TransactionCategory({ transaction }: TransactionProps): ReactElement {
    if (transaction.categoryId === null) {
        return <InlineCategorize transaction={transaction} />;
    }
    return <CategorizedCell transaction={transaction} />;
}
