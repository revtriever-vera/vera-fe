import type { UseMutationResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useDeleteConversation } from '../api/use-delete-conversation.mutation';

export interface DeleteConversationDialogProps {
    readonly conversationId: string;
    readonly onClose: () => void;
}

export function DeleteConversationDialog({ conversationId, onClose }: DeleteConversationDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const toast: ToastApi = useToast();
    const deletion: UseMutationResult<void, Error, string> = useDeleteConversation();
    return (
        <ConfirmDialog
            destructive
            title={t('delete.title')}
            description={t('delete.body')}
            confirmLabel={t('delete.confirm')}
            pending={deletion.isPending}
            onCancel={onClose}
            onConfirm={(): void => {
                deletion.mutate(conversationId, {
                    onSuccess: onClose,
                    onError: (): void => {
                        toast.show({ tone: 'critical', title: t('delete.failed') });
                        onClose();
                    }
                });
            }}
        />
    );
}
