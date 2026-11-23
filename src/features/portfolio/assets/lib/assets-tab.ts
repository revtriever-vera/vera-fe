export const ASSETS_TABS = ['list', 'fixed-income', 'concentration'] as const;

export type AssetsTab = (typeof ASSETS_TABS)[number];

export const AVAILABLE_ASSETS_TABS: readonly AssetsTab[] = ['list', 'fixed-income'];

export const DEFAULT_ASSETS_TAB: AssetsTab = 'list';

export function resolveAssetsTab(tab: AssetsTab | undefined): AssetsTab {
    return tab !== undefined && AVAILABLE_ASSETS_TABS.includes(tab) ? tab : DEFAULT_ASSETS_TAB;
}
