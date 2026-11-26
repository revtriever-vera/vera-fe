import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';

export interface ActionButtonsProps {
    readonly confirmPending: boolean;
    readonly busy: boolean;
    readonly canConfirm: boolean;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
}

export function ActionButtons({ confirmPending, busy, canConfirm, onConfirm, onCancel }: ActionButtonsProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <div className="flex gap-2">
            <Button size="sm" loading={confirmPending} disabled={busy || !canConfirm} onClick={onConfirm}>
                {t('action.confirm')}
            </Button>
            <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
                {t('action.cancel')}
            </Button>
        </div>
    );
}
