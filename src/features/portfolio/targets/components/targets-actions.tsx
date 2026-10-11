import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';

export interface TargetsActionsProps {
    readonly dirty: boolean;
    readonly canSave: boolean;
    readonly saving: boolean;
    readonly onDiscard: () => void;
    readonly onReset: () => void;
}

export function TargetsActions({ dirty, canSave, saving, onDiscard, onReset }: TargetsActionsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={onDiscard}>
                {t('targets.discard')}
            </Button>
            <Button type="button" variant="secondary" disabled={saving} onClick={onReset}>
                {t('targets.reset')}
            </Button>
            <Button type="submit" disabled={!canSave} loading={saving}>
                {saving ? t('targets.saving') : t('targets.save')}
            </Button>
        </div>
    );
}
