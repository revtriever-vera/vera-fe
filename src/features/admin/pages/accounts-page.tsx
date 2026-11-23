import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { EmptyState } from '@/shared/ui/empty-state';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Pager } from '@/shared/ui/pager';
import { SearchInput } from '@/shared/ui/search-input';
import { SkeletonTable } from '@/shared/ui/skeleton-table';
import { ACCOUNTS_PAGE_SIZE, usePlatformAccounts } from '../api/use-platform-accounts.query';
import { AccountDetail, type OpenedAccount } from '../components/account-detail';
import { AccountsTable } from '../components/accounts-table';
import { LinkFunnel } from '../components/link-funnel';
import { OpenAccountDialog } from '../components/open-account-dialog';
import { PlatformOverviewCards } from '../components/platform-overview-cards';
import { platformRefusal } from '../lib/platform-refusal';
import type { AccountAccess, AccountItem, AccountList } from '../types';

const SEARCH_DELAY_MS: number = 300;

interface AccountsListProps {
    readonly accounts: UseQueryResult<AccountList>;
    readonly search: string;
    readonly onOpen: (account: AccountItem) => void;
    readonly onPage: (page: number) => void;
}

function AccountsList({ accounts, search, onOpen, onPage }: AccountsListProps): ReactElement | null {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    if (accounts.isError) {
        return platformRefusal(accounts.error) === null ? <FailureAlert error={accounts.error} title={t('accountsLoadError')} /> : null;
    }
    if (accounts.data === undefined) {
        return (
            <SkeletonTable
                label={t('accountsTableLabel')}
                columns={[t('accountColumnName'), t('accountColumnPlan'), t('accountColumnCreated')]}
            />
        );
    }
    if (accounts.data.items.length === 0) {
        return (
            <EmptyState
                title={t(search === '' ? 'accountsEmptyTitle' : 'accountsNoMatchTitle')}
                description={t(search === '' ? 'accountsEmptyDescription' : 'accountsNoMatchDescription')}
            />
        );
    }
    return (
        <>
            <AccountsTable accounts={accounts.data.items} onOpen={onOpen} />
            <Pager page={accounts.data.page} totalPages={Math.ceil(accounts.data.total / ACCOUNTS_PAGE_SIZE)} onChange={onPage} />
        </>
    );
}

interface AccountsBrowserState {
    readonly search: string;
    readonly term: string;
    readonly accounts: UseQueryResult<AccountList>;
    readonly changeSearch: (value: string) => void;
    readonly setPage: (page: number) => void;
}

function useAccountsBrowser(): AccountsBrowserState {
    const [search, setSearch] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const term: string = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);
    const accounts: UseQueryResult<AccountList> = usePlatformAccounts(page, term);
    const changeSearch = (value: string): void => {
        setSearch(value);
        setPage(1);
    };
    return { search, term, accounts, changeSearch, setPage };
}

function AccountsBrowser({ onOpen }: { readonly onOpen: (account: AccountItem) => void }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const { search, term, accounts, changeSearch, setPage }: AccountsBrowserState = useAccountsBrowser();
    return (
        <div className="flex flex-col gap-3">
            <SearchInput
                value={search}
                onChange={changeSearch}
                label={t('accountsSearchLabel')}
                placeholder={t('accountsSearchPlaceholder')}
                className="max-w-sm"
            />
            <AccountsList accounts={accounts} search={term} onOpen={onOpen} onPage={setPage} />
        </div>
    );
}

export function AccountsPage(): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const [opening, setOpening] = useState<AccountItem | null>(null);
    const [opened, setOpened] = useState<OpenedAccount | null>(null);

    if (opened !== null) {
        return (
            <AccountDetail
                opened={opened}
                onBack={(): void => {
                    setOpened(null);
                }}
            />
        );
    }
    return (
        <section className="flex flex-col gap-6 px-page-x py-6">
            <header>
                <h1 className="text-2xl font-extrabold tracking-tight">{t('accountsTitle')}</h1>
                <p className="text-content-muted">{t('accountsSubtitle')}</p>
            </header>
            <PlatformOverviewCards />
            <LinkFunnel />
            <AccountsBrowser onOpen={setOpening} />
            {opening === null ? null : (
                <OpenAccountDialog
                    account={opening}
                    onClose={(): void => {
                        setOpening(null);
                    }}
                    onOpened={(access: AccountAccess, reason: string): void => {
                        setOpened({ account: opening, access, reason });
                        setOpening(null);
                    }}
                />
            )}
        </section>
    );
}
