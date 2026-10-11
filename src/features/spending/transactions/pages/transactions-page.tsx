import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Link, useNavigate, useSearch, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { Button, buttonVariants } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { SkeletonTable } from '@/shared/ui/skeleton-table';
import { useAccounts } from '../../api/use-accounts.query';
import { SpendingEmptyState } from '../../components/spending-empty-state';
import type { TransactionsSearch } from '../../schemas/spending-search.schema';
import type { AccountsResponse, TransactionsQuery, TransactionsResponse } from '../../types';
import { useTransactions } from '../api/use-transactions.query';
import { ExportMenu } from '../components/export-menu';
import { TransactionsCardList } from '../components/transactions-card-list';
import { TransactionsFilters } from '../components/transactions-filters';
import { TransactionsTable } from '../components/transactions-table';
import { TransactionsTotals } from '../components/transactions-totals';
import { UncategorizedBanner } from '../components/uncategorized-banner';
import { currentMonth } from '../lib/month-navigation';
import {
    clearedFilters,
    filtersToQuery,
    hasActiveFilters,
    pageQuery,
    withFilter,
    withPage,
    type FilterPatch
} from '../lib/transaction-filters';

const NARROW_QUERY: string = '(max-width: 639px)';

function PageHeader({ search, filters }: { readonly search: TransactionsSearch; readonly filters: TransactionsQuery }): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
                <h2 className="text-xl font-extrabold">{t('title')}</h2>
                <p className="max-w-xl text-sm text-content-muted">{t('description')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Link to="/spending/rules" className={buttonVariants({ variant: 'ghost' })}>
                    {t('actions.rules')}
                </Link>
                <Link to="/spending/transactions" search={{ ...search, import: true }} className={buttonVariants({ variant: 'secondary' })}>
                    {t('actions.import')}
                </Link>
                <ExportMenu filters={filters} />
            </div>
        </div>
    );
}

function ListLoading(): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    return (
        <SkeletonTable
            label={t('list.loading')}
            columns={[t('columns.date'), t('columns.description'), t('columns.category'), t('columns.account'), t('columns.amount')]}
        />
    );
}

function ListFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('list.loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('list.retry')}
            </Button>
        </div>
    );
}

interface EmptyFilterProps {
    readonly hasFilters: boolean;
    readonly onClear: () => void;
}

function EmptyFilter({ hasFilters, onClear }: EmptyFilterProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    if (!hasFilters) {
        return <EmptyState title={t('empty.monthTitle')} description={t('empty.monthDescription')} />;
    }
    return (
        <EmptyState
            title={t('empty.filteredTitle')}
            description={t('empty.filteredDescription')}
            action={
                <Button variant="secondary" onClick={onClear}>
                    {t('filters.clear')}
                </Button>
            }
        />
    );
}

interface ListProps extends EmptyFilterProps {
    readonly transactions: UseQueryResult<TransactionsResponse>;
    readonly onPageChange: (page: number) => void;
}

function TransactionsList({ transactions, hasFilters, onClear, onPageChange }: ListProps): ReactElement {
    const narrow: boolean = useMediaQuery(NARROW_QUERY);
    if (transactions.error !== null && transactions.data === undefined) {
        return (
            <ListFailure
                error={transactions.error}
                onRetry={(): void => {
                    void transactions.refetch();
                }}
            />
        );
    }
    if (transactions.data === undefined) {
        return <ListLoading />;
    }
    if (transactions.data.data.length === 0) {
        return <EmptyFilter hasFilters={hasFilters} onClear={onClear} />;
    }
    const List: (props: { readonly transactions: TransactionsResponse['data'] }) => ReactElement = narrow
        ? TransactionsCardList
        : TransactionsTable;
    return (
        <div className="flex flex-col gap-3" aria-busy={transactions.isPlaceholderData}>
            <List transactions={transactions.data.data} />
            <TransactionsTotals response={transactions.data} onPageChange={onPageChange} />
        </div>
    );
}

interface PageActions {
    readonly clear: () => void;
    readonly showUncategorized: () => void;
    readonly change: (patch: FilterPatch) => void;
    readonly changePage: (page: number) => void;
}

function usePageActions(search: TransactionsSearch): PageActions {
    const navigate: UseNavigateResult<string> = useNavigate();
    const go = (next: TransactionsSearch): void => {
        void navigate({ to: '/spending/transactions', search: next, replace: true });
    };
    return {
        clear: (): void => {
            go(clearedFilters(search));
        },
        showUncategorized: (): void => {
            go(withFilter(search, { uncategorized: true }));
        },
        change: (patch: FilterPatch): void => {
            go(withFilter(search, patch));
        },
        changePage: (page: number): void => {
            go(withPage(search, page));
        }
    };
}

function isCompanyEmpty(accounts: UseQueryResult<AccountsResponse>): boolean {
    return accounts.data !== undefined && accounts.data.accounts.every((account): boolean => account.transactionCount === 0);
}

export function TransactionsPage(): ReactElement {
    const search: TransactionsSearch = useSearch({ from: '/_auth/_app/spending/transactions' });
    const actions: PageActions = usePageActions(search);
    const accounts: UseQueryResult<AccountsResponse> = useAccounts();
    const month: string = search.month ?? currentMonth();
    const resolved: TransactionsSearch = { ...search, month };
    const transactions: UseQueryResult<TransactionsResponse> = useTransactions(pageQuery(resolved));
    const hasFilters: boolean = hasActiveFilters(search);
    if (isCompanyEmpty(accounts)) {
        return <SpendingEmptyState />;
    }
    return (
        <section className="flex flex-col gap-4">
            <PageHeader search={search} filters={filtersToQuery(resolved)} />
            <UncategorizedBanner onShowUncategorized={actions.showUncategorized} />
            <TransactionsFilters search={search} month={month} hasFilters={hasFilters} onClear={actions.clear} onChange={actions.change} />
            <TransactionsList
                transactions={transactions}
                hasFilters={hasFilters}
                onClear={actions.clear}
                onPageChange={actions.changePage}
            />
        </section>
    );
}
