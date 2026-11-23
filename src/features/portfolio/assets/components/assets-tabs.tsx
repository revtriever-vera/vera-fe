import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { panelId, tabId } from '@/shared/ui/segmented-tablist';
import { AVAILABLE_ASSETS_TABS, type AssetsTab } from '../lib/assets-tab';

const ID_PREFIX: string = 'assets';

const LABEL_KEYS: Readonly<Record<AssetsTab, 'tabs.list' | 'tabs.fixedIncome' | 'tabs.concentration'>> = {
    list: 'tabs.list',
    'fixed-income': 'tabs.fixedIncome',
    concentration: 'tabs.concentration'
};

export interface AssetsTabsProps {
    readonly tab: AssetsTab;
    readonly onChange: (tab: AssetsTab) => void;
}

export function AssetsTabs({ tab, onChange }: AssetsTabsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const options: readonly SegmentedOption<AssetsTab>[] = AVAILABLE_ASSETS_TABS.map(
        (value: AssetsTab): SegmentedOption<AssetsTab> => ({ value, label: t(LABEL_KEYS[value]) })
    );
    return <SegmentedControl mode="tablist" idPrefix={ID_PREFIX} label={t('tabs.label')} options={options} value={tab} onChange={onChange} />;
}

export function AssetsTabPanel({ tab, children }: { readonly tab: AssetsTab; readonly children: ReactElement }): ReactElement {
    return (
        <div role="tabpanel" id={panelId(ID_PREFIX)} aria-labelledby={tabId(ID_PREFIX, tab)} className="flex flex-col gap-4">
            {children}
        </div>
    );
}
