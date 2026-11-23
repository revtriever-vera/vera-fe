import type { ReactElement, ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ASSETS_TABS, type AssetsTab } from '../types';

export interface AssetsTabsProps {
    readonly value: AssetsTab;
    readonly onValueChange: (tab: AssetsTab) => void;
    readonly panels: Readonly<Record<AssetsTab, ReactNode>>;
}

const TRIGGER_CLASS: string =
    'whitespace-nowrap rounded-control px-3 py-1.5 text-sm text-content-muted transition hover:bg-surface-muted data-[state=active]:bg-surface data-[state=active]:font-medium data-[state=active]:text-content data-[state=active]:shadow-card';

function isAssetsTab(value: string): value is AssetsTab {
    return (ASSETS_TABS as readonly string[]).includes(value);
}

export function AssetsTabs({ value, onValueChange, panels }: AssetsTabsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const change = (next: string): void => {
        if (isAssetsTab(next)) {
            onValueChange(next);
        }
    };
    return (
        <Tabs.Root value={value} onValueChange={change} className="flex flex-col gap-4">
            <Tabs.List
                aria-label={t('tabs.label')}
                className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-control border border-border bg-surface-muted p-1"
            >
                {ASSETS_TABS.map((tab: AssetsTab): ReactElement => (
                    <Tabs.Trigger key={tab} value={tab} className={TRIGGER_CLASS}>
                        {t(`tabs.${tab}`)}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>
            {ASSETS_TABS.map((tab: AssetsTab): ReactElement => (
                <Tabs.Content key={tab} value={tab} className="flex flex-col gap-4 focus-visible:outline-none">
                    {panels[tab]}
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
}
