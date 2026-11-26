import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

export interface ModelConsentDialogProps {
    readonly onSend: () => void;
    readonly onCancel: () => void;
}

export function ModelConsentDialog({ onSend, onCancel }: ModelConsentDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    return (
        <ConfirmDialog
            title={t('consent.title')}
            description={t('consent.description')}
            confirmLabel={t('consent.send')}
            cancelLabel={t('actions.cancel')}
            onConfirm={onSend}
            onCancel={onCancel}
        />
    );
}
