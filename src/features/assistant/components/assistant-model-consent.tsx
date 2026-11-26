import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

export interface AssistantModelConsentProps {
    readonly onSend: () => void;
    readonly onCancel: () => void;
}

export function AssistantModelConsent({ onSend, onCancel }: AssistantModelConsentProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <ConfirmDialog
            title={t('consent.title')}
            description={t('consent.description')}
            confirmLabel={t('consent.send')}
            cancelLabel={t('consent.cancel')}
            onConfirm={onSend}
            onCancel={onCancel}
        />
    );
}
