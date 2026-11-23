import type { ReactElement } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { AccountAccess, AccountItem } from '../types';
import { AccountSections } from './account-sections';
import { AccountSummaryView } from './account-summary';

export interface OpenedAccount {
    readonly account: AccountItem;
    readonly access: AccountAccess;
    readonly reason: string;
}

export interface AccountDetailProps {
    readonly opened: OpenedAccount;
    readonly onBack: () => void;
}

export function AccountDetail({ opened, onBack }: AccountDetailProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const { account, access, reason }: OpenedAccount = opened;
    return (
        <section className="flex flex-col gap-4 px-page-x py-6" aria-label={account.name}>
            <header className="flex flex-col items-start gap-3">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    {t('detailBack')}
                </Button>
                <h1 className="text-2xl font-extrabold tracking-tight">{account.name}</h1>
                <Badge tone="positive">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    {t('detailRecorded')}
                </Badge>
                <p className="text-sm text-content-muted">{t('detailReason', { reason })}</p>
            </header>
            <Alert tone="caution" title={t('detailReadOnly')} />
            {access.summary === undefined ? null : <AccountSummaryView summary={access.summary} />}
            {access.data === undefined ? null : <AccountSections title={t('dataTitle')} sections={access.data} />}
        </section>
    );
}
