import type { ReactElement, ReactNode } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { SettingsNav } from '../components/settings-nav';
import { useSettingsMode } from '../lib/use-settings-mode';
import { SETTINGS_MODE, type SettingsMode } from '../types';

export function SettingsPage({ children }: { readonly children: ReactNode }): ReactElement {
    const { t }: UseTranslationResponse<'settings', undefined> = useTranslation('settings');
    const { mode }: { mode: SettingsMode } = useSettingsMode();
    return (
        <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-4 px-page-x py-page-y">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-extrabold">{t('title')}</h1>
                <p className="text-sm text-content-muted">
                    {mode === SETTINGS_MODE.selfHosted ? t('descriptionSelfHosted') : t('description')}
                </p>
            </header>
            <div className="grid min-w-0 gap-6 min-[901px]:grid-cols-[13rem_minmax(0,1fr)] min-[901px]:items-start">
                <SettingsNav context={{ mode }} />
                <div className="flex min-w-0 flex-col gap-4">{children}</div>
            </div>
        </div>
    );
}
