import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';

export interface AssetTargetsActionsProps {
    readonly dirty: boolean;
    readonly canSave: boolean;
    readonly saving: boolean;
    readonly onDiscard: () => void;
}

export function AssetTargetsActions({ dirty, canSave, saving, onDiscard }: AssetTargetsActionsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={onDiscard}>
                {t('classDetail.discard')}
            </Button>
            <Button type="submit" disabled={!canSave} loading={saving}>
                {saving ? t('classDetail.saving') : t('classDetail.save')}
            </Button>
        </div>
    );
}
