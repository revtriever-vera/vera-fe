import type { ReactElement } from 'react';
import { Outlet } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { TabNav, type TabItem } from '@/shared/ui/tab-nav';
import { ImportStatementHost } from '../imports/components/import-statement-host';

export function SpendingLayout(): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const tabs: readonly TabItem[] = [
        { to: '/gastos', label: t('layout.tabs.summary'), exact: true },
        { to: '/gastos/transacoes', label: t('layout.tabs.transactions') },
        { to: '/gastos/cortes', label: t('layout.tabs.cuts') },
        { to: '/gastos/conexoes', label: t('layout.tabs.connections') },
        { to: '/gastos/regras', label: t('layout.tabs.rules') }
    ];
    return (
        <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-4 px-page-x py-page-y">
            <h1 className="text-2xl font-extrabold">{t('layout.title')}</h1>
            <TabNav label={t('layout.tabsLabel')} tabs={tabs} />
            <Outlet />
            <ImportStatementHost />
        </div>
    );
}
