import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { SkeletonTable } from '@/shared/ui/skeleton-table';
import { useRevokePlatformToken } from '../api/use-revoke-platform-token.mutation';
import { usePlatformTokens } from '../api/use-platform-tokens.query';
import { PlatformTokenForm } from '../components/platform-token-form';
import { PlatformTokenReveal } from '../components/platform-token-reveal';
import { PlatformTokensTable } from '../components/platform-tokens-table';
import { platformRefusal } from '../lib/platform-refusal';
import { platformTokenErrorMessage } from '../lib/platform-token-error-message';
import type { CreatedPlatformToken, PlatformToken, PlatformTokenList } from '../types';

const SKELETON_COLUMNS: readonly (
    'tokenColumnName' | 'tokenColumnCreated' | 'tokenColumnExpires' | 'tokenColumnLastUsed' | 'tokenColumnStatus'
)[] = ['tokenColumnName', 'tokenColumnCreated', 'tokenColumnExpires', 'tokenColumnLastUsed', 'tokenColumnStatus'];

function RevokeDialog({ token, onClose }: { readonly token: PlatformToken; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const toast: ToastApi = useToast();
    const revoke: ReturnType<typeof useRevokePlatformToken> = useRevokePlatformToken();
    const confirm = (): void => {
        revoke.mutate(token.id, {
            onSuccess: (): void => {
                toast.show({ tone: 'positive', title: t('tokenRevoked') });
                onClose();
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: platformTokenErrorMessage(t, error) });
                onClose();
            }
        });
    };
    return (
        <ConfirmDialog
            title={t('tokenRevokeTitle')}
            description={`${token.name}. ${t('tokenRevokeDescription')}`}
            confirmLabel={t('tokenRevokeConfirm')}
            cancelLabel={t('formCancel')}
            destructive
            pending={revoke.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}

function TokensHeader({ onNew }: { readonly onNew: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{t('tokensTitle')}</h1>
                <p className="text-content-muted">{t('tokensSubtitle')}</p>
            </div>
            <Button onClick={onNew}>
                <Plus className="size-4" aria-hidden="true" />
                {t('tokensNew')}
            </Button>
        </header>
    );
}

function TokensContent({
    tokens,
    onRevoke
}: {
    readonly tokens: PlatformTokenList;
    readonly onRevoke: (token: PlatformToken) => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    if (tokens.items.length === 0) {
        return <EmptyState title={t('tokensEmptyTitle')} description={t('tokensEmptyDescription')} />;
    }
    return <PlatformTokensTable tokens={tokens.items} onRevoke={onRevoke} />;
}

interface TokenDialogsProps {
    readonly creating: boolean;
    readonly created: CreatedPlatformToken | null;
    readonly revoking: PlatformToken | null;
    readonly onCreated: (token: CreatedPlatformToken) => void;
    readonly onCloseForm: () => void;
    readonly onCloseReveal: () => void;
    readonly onCloseRevoke: () => void;
}

function TokenDialogs(props: TokenDialogsProps): ReactElement {
    return (
        <>
            {props.creating ? <PlatformTokenForm onCreated={props.onCreated} onClose={props.onCloseForm} /> : null}
            {props.created === null ? null : <PlatformTokenReveal token={props.created} onClose={props.onCloseReveal} />}
            {props.revoking === null ? null : <RevokeDialog token={props.revoking} onClose={props.onCloseRevoke} />}
        </>
    );
}

export function TokensPage(): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const tokens: UseQueryResult<PlatformTokenList> = usePlatformTokens();
    const [creating, setCreating] = useState<boolean>(false);
    const [created, setCreated] = useState<CreatedPlatformToken | null>(null);
    const [revoking, setRevoking] = useState<PlatformToken | null>(null);
    const failed: boolean = tokens.isError && platformRefusal(tokens.error) === null;

    return (
        <section className="flex flex-col gap-4 px-page-x py-6">
            <TokensHeader
                onNew={(): void => {
                    setCreating(true);
                }}
            />
            {failed ? <FailureAlert error={tokens.error} title={t('tokensLoadError')} /> : null}
            {tokens.isPending ? (
                <SkeletonTable label={t('tokensTableLabel')} columns={SKELETON_COLUMNS.map((key): string => t(key))} />
            ) : null}
            {tokens.data === undefined ? null : <TokensContent tokens={tokens.data} onRevoke={setRevoking} />}
            <TokenDialogs
                creating={creating}
                created={created}
                revoking={revoking}
                onCreated={(token: CreatedPlatformToken): void => {
                    setCreating(false);
                    setCreated(token);
                }}
                onCloseForm={(): void => {
                    setCreating(false);
                }}
                onCloseReveal={(): void => {
                    setCreated(null);
                }}
                onCloseRevoke={(): void => {
                    setRevoking(null);
                }}
            />
        </section>
    );
}
