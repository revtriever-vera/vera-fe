import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ResponsiveRows } from '@/shared/ui/responsive-rows';
import type { TableColumn } from '@/shared/ui/table';
import type { AccountItem } from '../types';

export interface AccountsTableProps {
    readonly accounts: readonly AccountItem[];
    readonly onOpen: (account: AccountItem) => void;
}

const MIN_WIDTH: string = 'min-w-[40rem]';

function PlanBadge({ account }: { readonly account: AccountItem }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const locale: SupportedLocale = useLocale();
    const isTrial: boolean = account.trialEndsAt !== null;
    if (account.plan === 'free') {
        return <Badge tone="neutral">{t('planFree')}</Badge>;
    }
    return (
        <span className="flex flex-col gap-0.5">
            <Badge tone="accent">{t(isTrial ? 'planTrial' : 'planPremium')}</Badge>
            {account.trialEndsAt === null ? null : (
                <span className="text-xs text-content-muted">
                    {t('planTrialEnds', { date: formatDate(new Date(account.trialEndsAt), locale, 'UTC') })}
                </span>
            )}
        </span>
    );
}

function useColumns(onOpen: (account: AccountItem) => void): readonly TableColumn<AccountItem>[] {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const locale: SupportedLocale = useLocale();
    return [
        { key: 'name', header: t('accountColumnName'), render: (account: AccountItem): string => account.name },
        { key: 'plan', header: t('accountColumnPlan'), render: (account: AccountItem): ReactElement => <PlanBadge account={account} /> },
        {
            key: 'createdAt',
            header: t('accountColumnCreated'),
            render: (account: AccountItem): string => formatDate(new Date(account.createdAt), locale, 'UTC')
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: (account: AccountItem): ReactElement => (
                <Button
                    variant="secondary"
                    size="sm"
                    aria-label={t('openAccountNamed', { name: account.name })}
                    onClick={(): void => {
                        onOpen(account);
                    }}
                >
                    {t('openAccount')}
                </Button>
            )
        }
    ];
}

export function AccountsTable({ accounts, onOpen }: AccountsTableProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const columns: readonly TableColumn<AccountItem>[] = useColumns(onOpen);
    return (
        <ResponsiveRows
            label={t('accountsTableLabel')}
            columns={columns}
            rows={accounts}
            rowKey={(account: AccountItem): string => account.id}
            minWidthClass={MIN_WIDTH}
        />
    );
}
