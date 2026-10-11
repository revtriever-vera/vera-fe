import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UnsavedGuard } from '@/shared/lib/use-unsaved-guard';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

export function UnsavedDialog({ guard }: { readonly guard: UnsavedGuard }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    if (!guard.blocked) {
        return null;
    }
    return (
        <ConfirmDialog
            title={t('unsaved.title')}
            description={t('unsaved.description')}
            confirmLabel={t('unsaved.leave')}
            cancelLabel={t('unsaved.stay')}
            destructive
            onConfirm={guard.leave}
            onCancel={guard.stay}
        />
    );
}
