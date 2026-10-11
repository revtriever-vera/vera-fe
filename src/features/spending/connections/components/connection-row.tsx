import type { ReactElement } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { InstitutionAvatar } from '../../components/institution-avatar';
import type { ConnectionView } from '../../types';
import { consentExpiresSoon, shortDate, syncStamp, type SyncStamp } from '../lib/format-sync-time';
import { connectionHelpKey, helpTarget, type HelpKey, type HelpTarget } from '../lib/connection-help';
import { ConnectionStatusChip } from './connection-status-chip';

export interface ConnectionRowProps {
    readonly connection: ConnectionView;
    readonly now: Date;
    readonly syncPending: boolean;
    readonly onSync: (id: string) => void;
    readonly onRemove: (connection: ConnectionView) => void;
    readonly onShowStep: (step: number) => void;
    readonly onRotate: () => void;
}

function UpdatedAt({ connection, now }: { readonly connection: ConnectionView; readonly now: Date }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const locale: SupportedLocale = useLocale();
    if (connection.syncing) {
        return <span aria-busy="true">{t('banks.syncing')}</span>;
    }
    if (connection.lastSuccessAt === null) {
        return <span>{t('banks.neverUpdated')}</span>;
    }
    const stamp: SyncStamp = syncStamp(connection.lastSuccessAt, now, locale);
    return stamp.kind === 'today' ? (
        <span>{t('banks.updatedToday', { time: stamp.time })}</span>
    ) : (
        <span>{t('banks.updatedAt', { date: stamp.date })}</span>
    );
}

function AccountsLine({ connection }: { readonly connection: ConnectionView }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    if (connection.accounts.length === 0) {
        return null;
    }
    return (
        <ul className="flex flex-col text-xs text-content-muted">
            {connection.accounts.map((account): ReactElement => (
                <li key={account.accountId}>
                    {account.numberLast4 === null
                        ? t('banks.accountLineNoNumber', { name: account.name })
                        : t('banks.accountLine', { name: account.name, last4: account.numberLast4 })}
                </li>
            ))}
        </ul>
    );
}

function Help({
    helpKey,
    onShowStep,
    onRotate
}: {
    readonly helpKey: HelpKey;
    readonly onShowStep: (step: number) => void;
    readonly onRotate: () => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const target: HelpTarget = helpTarget(helpKey);
    return (
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-content">
            <span>{t(helpKey)}</span>
            <button
                type="button"
                className="font-semibold text-accent-strong underline underline-offset-2"
                onClick={(): void => {
                    if (target.kind === 'step') {
                        onShowStep(target.step);
                        return;
                    }
                    onRotate();
                }}
            >
                {t(target.label)}
            </button>
        </p>
    );
}

function RowHeader({ connection, now }: { readonly connection: ConnectionView; readonly now: Date }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const locale: SupportedLocale = useLocale();
    const expiry: string | null = connection.consentExpiresAt;
    return (
        <div className="flex items-start gap-3">
            <InstitutionAvatar name={connection.connectorName} logoUrl={connection.institutionLogoUrl} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                    <b className="text-sm text-content">{connection.connectorName ?? t('banks.unknownBank')}</b>
                    <ConnectionStatusChip status={connection.status} />
                </div>
                <AccountsLine connection={connection} />
                <span className="text-xs text-content-muted">
                    <UpdatedAt connection={connection} now={now} />
                </span>
                {expiry !== null && consentExpiresSoon(expiry, now) ? (
                    <span className="text-xs text-caution">{t('banks.consentExpires', { date: shortDate(expiry, locale) })}</span>
                ) : null}
            </div>
        </div>
    );
}

interface RowActionsProps {
    readonly connection: ConnectionView;
    readonly syncPending: boolean;
    readonly onSync: (id: string) => void;
    readonly onRemove: (connection: ConnectionView) => void;
}

function RowActions({ connection, syncPending, onSync, onRemove }: RowActionsProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const bank: string = connection.connectorName ?? t('banks.unknownBank');
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant="secondary"
                size="sm"
                disabled={connection.syncing || syncPending}
                onClick={(): void => {
                    onSync(connection.id);
                }}
            >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                {t('banks.syncOne')} <span className="sr-only">{bank}</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={(): void => {
                    onRemove(connection);
                }}
            >
                {t('banks.remove')} <span className="sr-only">{bank}</span>
            </Button>
        </div>
    );
}

export function ConnectionRow({ connection, now, syncPending, onSync, onRemove, onShowStep, onRotate }: ConnectionRowProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const helpKey: HelpKey | null = connectionHelpKey(connection.status, connection.statusReason);
    return (
        <li className="flex flex-col gap-2 rounded-card border border-border p-3" aria-busy={connection.syncing}>
            <RowHeader connection={connection} now={now} />
            {connection.lastRun?.status === 'failed' ? <p className="text-sm text-caution">{t('banks.lastRunFailed')}</p> : null}
            {helpKey === null ? null : <Help helpKey={helpKey} onShowStep={onShowStep} onRotate={onRotate} />}
            <RowActions connection={connection} syncPending={syncPending} onSync={onSync} onRemove={onRemove} />
        </li>
    );
}
