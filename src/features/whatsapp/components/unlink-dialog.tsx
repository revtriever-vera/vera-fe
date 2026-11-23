import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useUnlink } from '../api/use-unlink.mutation';
import { formatPhone } from '../lib/format-phone';
import { whatsappErrorMessage } from '../lib/whatsapp-error-message';

export interface UnlinkDialogProps {
    readonly phone: string;
    readonly onClose: () => void;
    readonly onUnlinked: () => void;
}

export function UnlinkDialog({ phone, onClose, onUnlinked }: UnlinkDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const { t: tBilling }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const toast: ToastApi = useToast();
    const unlink: UseMutationResult<void, Error, void> = useUnlink();
    const confirm = (): void => {
        unlink.mutate(undefined, {
            onSuccess: (): void => {
                track('whatsapp_unlinked');
                toast.show({ tone: 'positive', title: t('toasts.unlinked') });
                onUnlinked();
                onClose();
            },
            onError: (error: Error): void => {
                toast.show({ tone: 'critical', title: whatsappErrorMessage(t, tBilling, error, locale) });
                onClose();
            }
        });
    };
    return (
        <ConfirmDialog
            title={t('linked.dialogTitle')}
            description={t('linked.dialogText', { phone: formatPhone(phone) })}
            confirmLabel={t('linked.dialogConfirm')}
            cancelLabel={t('linked.dialogCancel')}
            destructive
            pending={unlink.isPending}
            onConfirm={confirm}
            onCancel={onClose}
        />
    );
}
