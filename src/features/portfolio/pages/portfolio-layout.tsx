import type { ReactElement } from 'react';
import { Outlet } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { TabNav, type TabItem } from '@/shared/ui/tab-nav';

export function PortfolioLayout(): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const tabs: readonly TabItem[] = [
        { to: '/portfolio', label: t('layout.tabs.overview'), exact: true },
        { to: '/portfolio/targets', label: t('layout.tabs.targets') },
        { to: '/portfolio/contribution', label: t('layout.tabs.contribution') },
        { to: '/portfolio/assets', label: t('layout.tabs.assets') }
    ];
    return (
        <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-4 px-page-x py-page-y">
            <h1 className="text-2xl font-extrabold">{t('layout.title')}</h1>
            <TabNav label={t('layout.tabsLabel')} tabs={tabs} />
            <Outlet />
        </div>
    );
}
