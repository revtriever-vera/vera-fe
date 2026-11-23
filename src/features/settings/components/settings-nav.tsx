import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { SettingsTab, SettingsTabContext } from '../types';
import { visibleSettingsTabs } from '../lib/settings-tabs';

const LINK_CLASS: string =
    'min-h-11 whitespace-nowrap rounded-control px-3 py-2 text-sm font-semibold text-content-muted transition-colors hover:bg-accent-tint hover:text-content max-[900px]:rounded-full max-[900px]:border max-[900px]:border-border max-[900px]:bg-surface max-[900px]:text-[13px]';
const ACTIVE_CLASS: string = 'bg-accent-soft font-bold text-accent-strong max-[900px]:border-accent';

export function SettingsNav({ context }: { readonly context: SettingsTabContext }): ReactElement {
    const { t }: UseTranslationResponse<'settings', undefined> = useTranslation('settings');
    return (
        <nav
            aria-label={t('navLabel')}
            className="flex gap-1.5 overflow-x-auto min-[901px]:sticky min-[901px]:top-6 min-[901px]:flex-col min-[901px]:gap-0.5 min-[901px]:overflow-visible"
        >
            {visibleSettingsTabs(context).map((tab: SettingsTab): ReactElement => (
                <Link
                    key={tab.id}
                    to="/settings/$tab"
                    params={{ tab: tab.id }}
                    className={LINK_CLASS}
                    activeProps={{ className: ACTIVE_CLASS }}
                >
                    {t(tab.labelKey)}
                </Link>
            ))}
        </nav>
    );
}
