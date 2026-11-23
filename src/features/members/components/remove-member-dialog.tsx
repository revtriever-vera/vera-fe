import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useRemoveMember } from '../api/use-remove-member.mutation';
import { useRevokeInvite } from '../api/use-revoke-invite.mutation';
import type { PersonRow } from '../lib/person-rows';
import { useMemberFailure } from '../lib/use-member-failure';

interface RemoveMemberDialogProps {
    readonly person: PersonRow;
    readonly onClose: () => void;
}

export function RemoveMemberDialog({ person, onClose }: RemoveMemberDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const toast: ToastApi = useToast();
    const fail: (error: Error) => void = useMemberFailure();
    const removeMember: UseMutationResult<void, Error, string> = useRemoveMember();
    const revokeInvite: UseMutationResult<void, Error, string> = useRevokeInvite();
    const mutation: UseMutationResult<void, Error, string> = person.pending ? revokeInvite : removeMember;

    const confirm = (): void => {
        mutation.mutate(person.id, {
            onSuccess: (): void => {
                track('member_removed');
                toast.show({ tone: 'positive', title: t(person.pending ? 'inviteRevoked' : 'memberRemoved', { name: person.name }) });
                onClose();
            },
            onError: (error: Error): void => {
                fail(error);
                onClose();
            }
        });
    };

    return (
        <ConfirmDialog
            title={t('removeTitle', { name: person.name })}
            description={t(person.pending ? 'removeInviteBody' : 'removeBody', { name: person.name })}
            confirmLabel={t('remove')}
            destructive
            pending={mutation.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
