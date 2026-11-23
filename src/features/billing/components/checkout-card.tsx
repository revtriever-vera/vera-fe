import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

export interface CardRedirectDialogProps {
    readonly url: string;
    readonly onCancel: () => void;
}

export function CardRedirectDialog({ url, onCancel }: CardRedirectDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    return (
        <ConfirmDialog
            title={t('checkout.redirect.title')}
            description={t('checkout.redirect.text')}
            confirmLabel={t('checkout.redirect.confirm')}
            cancelLabel={t('checkout.redirect.cancel')}
            onConfirm={(): void => {
                window.location.assign(url);
            }}
            onCancel={onCancel}
        />
    );
}
