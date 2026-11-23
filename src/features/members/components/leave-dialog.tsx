import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import { track } from '@/shared/lib/analytics';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useLeave } from '../api/use-leave.mutation';
import { useMemberFailure } from '../lib/use-member-failure';

export function LeaveDialog({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'members', undefined> = useTranslation('members');
    const { discardSession } = useSession();
    const navigate: UseNavigateResult<string> = useNavigate();
    const fail: (error: Error) => void = useMemberFailure();
    const leave: UseMutationResult<void, Error, void> = useLeave();

    const confirm = (): void => {
        leave.mutate(undefined, {
            onSuccess: (): void => {
                track('member_left');
                discardSession();
                void navigate({ to: '/login', search: { left: '1' }, replace: true });
            },
            onError: (error: Error): void => {
                fail(error);
                onClose();
            }
        });
    };

    return (
        <ConfirmDialog
            title={t('leaveTitle')}
            description={t('leaveBody')}
            confirmLabel={t('leaveConfirm')}
            destructive
            pending={leave.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
