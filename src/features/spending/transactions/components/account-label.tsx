import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAccounts } from '../../api/use-accounts.query';
import { InstitutionAvatar } from '../../components/institution-avatar';
import type { AccountView, AccountsResponse, TransactionView } from '../../types';

export function AccountLabel({ transaction }: { readonly transaction: TransactionView }): ReactElement {
    const accounts: UseQueryResult<AccountsResponse> = useAccounts();
    const account: AccountView | undefined = accounts.data?.accounts.find(
        (item: AccountView): boolean => item.id === transaction.accountId
    );
    return (
        <span className="inline-flex min-w-0 items-center gap-2">
            <InstitutionAvatar
                name={account?.institutionName ?? transaction.accountName}
                logoUrl={account?.institutionLogoUrl ?? null}
                size="sm"
            />
            <span className="min-w-0 break-words">{transaction.accountName}</span>
        </span>
    );
}
