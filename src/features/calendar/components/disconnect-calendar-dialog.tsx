import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useCalendarDisconnect } from '../api/use-calendar-disconnect.mutation';
import { calendarErrorMessage } from '../lib/calendar-error-message';

export function DisconnectCalendarDialog({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'calendar', undefined> = useTranslation('calendar');
    const toast: ToastApi = useToast();
    const disconnect: UseMutationResult<void, Error, void> = useCalendarDisconnect();
    const confirm = (): void => {
        disconnect.mutate(undefined, {
            onSuccess: (): void => {
                track('calendar_disconnected');
                toast.show({ tone: 'positive', title: t('toasts.disconnected') });
                onClose();
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: calendarErrorMessage(t, error) });
                onClose();
            }
        });
    };
    return (
        <ConfirmDialog
            title={t('disconnect.title')}
            description={t('disconnect.text')}
            confirmLabel={t('disconnect.confirm')}
            cancelLabel={t('disconnect.cancel')}
            destructive
            pending={disconnect.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
