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
import { useRevokeSignupLink } from '../api/use-revoke-signup-link.mutation';
import { useSignupLinks } from '../api/use-signup-links.query';
import { SignupLinkForm } from '../components/signup-link-form';
import { SignupLinksTable } from '../components/signup-links-table';
import { signupLinkErrorMessage } from '../lib/signup-link-error-message';
import { platformRefusal } from '../lib/platform-refusal';
import type { SignupLink, SignupLinkList } from '../types';

const SKELETON_COLUMNS: readonly ('linkColumnName' | 'linkColumnOffer' | 'linkColumnStatus' | 'linkColumnUses' | 'linkColumnExpires')[] = [
    'linkColumnName',
    'linkColumnOffer',
    'linkColumnStatus',
    'linkColumnUses',
    'linkColumnExpires'
];

function useCopyLink(): (link: SignupLink) => void {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const toast: ToastApi = useToast();
    return (link: SignupLink): void => {
        navigator.clipboard.writeText(link.url).then(
            (): void => {
                toast.show({ tone: 'positive', title: t('linkCopied') });
            },
            (): void => {
                toast.show({ tone: 'critical', title: t('linkCopyFailed') });
            }
        );
    };
}

function RevokeDialog({ link, onClose }: { readonly link: SignupLink; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const toast: ToastApi = useToast();
    const revoke: ReturnType<typeof useRevokeSignupLink> = useRevokeSignupLink();
    const confirm = (): void => {
        revoke.mutate(link.id, {
            onSuccess: (): void => {
                toast.show({ tone: 'positive', title: t('linkRevoked') });
                onClose();
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: signupLinkErrorMessage(t, error) });
                onClose();
            }
        });
    };
    return (
        <ConfirmDialog
            title={t('revokeTitle')}
            description={`${link.label}. ${t('revokeDescription')}`}
            confirmLabel={t('revokeConfirm')}
            cancelLabel={t('formCancel')}
            destructive
            pending={revoke.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}

function LinksContent({
    links,
    onRevoke
}: {
    readonly links: SignupLinkList;
    readonly onRevoke: (link: SignupLink) => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const copy: (link: SignupLink) => void = useCopyLink();
    if (links.items.length === 0) {
        return <EmptyState title={t('linksEmptyTitle')} description={t('linksEmptyDescription')} />;
    }
    return <SignupLinksTable links={links.items} onCopy={copy} onRevoke={onRevoke} />;
}

interface LinkDialogsProps {
    readonly creating: boolean;
    readonly revoking: SignupLink | null;
    readonly onCloseCreate: () => void;
    readonly onCloseRevoke: () => void;
}

function LinkDialogs({ creating, revoking, onCloseCreate, onCloseRevoke }: LinkDialogsProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const toast: ToastApi = useToast();
    return (
        <>
            {creating ? (
                <SignupLinkForm
                    onClose={onCloseCreate}
                    onCreated={(): void => {
                        onCloseCreate();
                        toast.show({ tone: 'positive', title: t('linkCreated') });
                    }}
                />
            ) : null}
            {revoking === null ? null : <RevokeDialog link={revoking} onClose={onCloseRevoke} />}
        </>
    );
}

export function LinksPage(): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const links: UseQueryResult<SignupLinkList> = useSignupLinks();
    const [creating, setCreating] = useState<boolean>(false);
    const [revoking, setRevoking] = useState<SignupLink | null>(null);
    const failed: boolean = links.isError && platformRefusal(links.error) === null;

    return (
        <section className="flex flex-col gap-4 px-page-x py-6">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">{t('linksTitle')}</h1>
                    <p className="text-content-muted">{t('linksSubtitle')}</p>
                </div>
                <Button
                    onClick={(): void => {
                        setCreating(true);
                    }}
                >
                    <Plus className="size-4" aria-hidden="true" />
                    {t('linksNew')}
                </Button>
            </header>
            {failed ? <FailureAlert error={links.error} title={t('linksLoadError')} /> : null}
            {links.isPending ? (
                <SkeletonTable label={t('linksTableLabel')} columns={SKELETON_COLUMNS.map((key): string => t(key))} />
            ) : null}
            {links.data === undefined ? null : <LinksContent links={links.data} onRevoke={setRevoking} />}
            <LinkDialogs
                creating={creating}
                revoking={revoking}
                onCloseCreate={(): void => {
                    setCreating(false);
                }}
                onCloseRevoke={(): void => {
                    setRevoking(null);
                }}
            />
        </section>
    );
}
