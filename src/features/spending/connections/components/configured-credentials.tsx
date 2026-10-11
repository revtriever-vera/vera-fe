import type { ReactElement } from 'react';
import { CircleCheck, CircleX, type LucideIcon } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { CredentialsView } from '../../types';
import { useTestCredentials } from '../api/use-test-credentials.mutation';
import { verifiedStamp } from '../lib/format-sync-time';
import type { SpendingConnectionsKey } from '../types';

export type ConfiguredAction = 'rotate' | 'items' | 'remove';

export interface ConfiguredCredentialsProps {
    readonly credentials: CredentialsView;
    readonly disabled: boolean;
    readonly onAction: (action: ConfiguredAction) => void;
}

function StatusBadge({ status }: { readonly status: CredentialsView['status'] }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    if (status === null) {
        return null;
    }
    const valid: boolean = status === 'valid';
    const Icon: LucideIcon = valid ? CircleCheck : CircleX;
    return (
        <Badge tone={valid ? 'positive' : 'critical'}>
            <Icon className="size-3.5" aria-hidden="true" />
            {valid ? t('credentials.configured.statusValid') : t('credentials.configured.statusInvalid')}
        </Badge>
    );
}

function useRetest(): { retest: () => void; pending: boolean } {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const test: UseMutationResult<CredentialsView, ApiError, void> = useTestCredentials();
    const retest = (): void => {
        test.mutate(undefined, {
            onSuccess: (result: CredentialsView): void => {
                toast.show(
                    result.status === 'valid'
                        ? { tone: 'positive', title: t('credentials.toasts.verified') }
                        : { tone: 'caution', title: t('credentials.toasts.stillInvalid') }
                );
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: spendingErrorMessage(ts, error) });
            }
        });
    };
    return { retest, pending: test.isPending };
}

function CredentialSummary({ credentials }: { readonly credentials: CredentialsView }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const locale: SupportedLocale = useLocale();
    const verified: string =
        credentials.lastVerifiedAt === null
            ? t('credentials.configured.neverVerified')
            : t('credentials.configured.verifiedAt', { date: verifiedStamp(credentials.lastVerifiedAt, locale) });
    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-content">
            <span className="font-semibold">{t('credentials.configured.label')}</span>
            <span aria-hidden="true">·</span>
            <code className="font-mono text-xs">{credentials.clientIdHint}</code>
            <span aria-hidden="true">·</span>
            <span className="text-content-muted">{verified}</span>
            <StatusBadge status={credentials.status} />
        </div>
    );
}

const ACTIONS: readonly { readonly action: ConfiguredAction; readonly key: SpendingConnectionsKey }[] = [
    { action: 'rotate', key: 'credentials.configured.rotate' },
    { action: 'items', key: 'credentials.configured.addBanks' },
    { action: 'remove', key: 'credentials.configured.remove' }
];

export function ConfiguredCredentials({ credentials, disabled, onAction }: ConfiguredCredentialsProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const { retest, pending } = useRetest();
    return (
        <div className="flex flex-col gap-3">
            <CredentialSummary credentials={credentials} />
            <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" loading={pending} disabled={disabled} onClick={retest}>
                    {pending ? t('credentials.configured.testingAgain') : t('credentials.configured.testAgain')}
                </Button>
                {ACTIONS.map(({ action, key }): ReactElement => (
                    <Button
                        key={action}
                        variant={action === 'remove' ? 'ghost' : 'secondary'}
                        size="sm"
                        disabled={disabled}
                        onClick={(): void => {
                            onAction(action);
                        }}
                    >
                        {t(key)}
                    </Button>
                ))}
            </div>
        </div>
    );
}
