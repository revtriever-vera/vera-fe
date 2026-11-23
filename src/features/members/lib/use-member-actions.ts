import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useChangeRole, type ChangeRoleInput } from '../api/use-change-role.mutation';
import { useResendInvite } from '../api/use-resend-invite.mutation';
import type { InviteResult, MemberRole, MemberView } from '../types';
import { useMemberFailure } from './use-member-failure';
import type { PersonRow } from './person-rows';

export interface MemberActions {
    readonly busy: boolean;
    readonly changeRole: (person: PersonRow, role: MemberRole) => void;
    readonly resend: (person: PersonRow) => void;
}

export function useMemberActions(): MemberActions {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const toast = useToast();
    const fail: (error: Error) => void = useMemberFailure();
    const change: UseMutationResult<MemberView, Error, ChangeRoleInput> = useChangeRole();
    const resend: UseMutationResult<InviteResult, Error, string> = useResendInvite();

    return {
        busy: change.isPending || resend.isPending,
        changeRole: (person: PersonRow, role: MemberRole): void => {
            change.mutate(
                { userId: person.id, role },
                {
                    onSuccess: (): void => {
                        track('member_role_changed', { from: person.role, to: role });
                        toast.show({ tone: 'positive', title: t('roleChanged', { name: person.name }) });
                    },
                    onError: fail
                }
            );
        },
        resend: (person: PersonRow): void => {
            resend.mutate(person.id, {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: t('inviteResent', { email: person.email ?? person.name }) });
                },
                onError: fail
            });
        }
    };
}
