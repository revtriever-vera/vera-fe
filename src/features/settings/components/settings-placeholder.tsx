import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import type { SettingsTabId, SettingsTabLabelKey } from '../types';

export interface SettingsPlaceholderProps {
    readonly title: SettingsTabLabelKey;
    readonly tab: SettingsTabId;
}

export function SettingsPlaceholder({ title, tab }: SettingsPlaceholderProps): ReactElement {
    const { t }: UseTranslationResponse<'settings', undefined> = useTranslation('settings');
    return (
        <Card role="region" aria-label={t(title)} data-tab={tab} className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-content">{t(title)}</h2>
            <p className="text-sm text-content-muted">{t('placeholder')}</p>
        </Card>
    );
}
