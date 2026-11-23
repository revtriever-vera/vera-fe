import { SETTINGS_MODE, SETTINGS_TAB, type SettingsMode, type SettingsTab, type SettingsTabContext, type SettingsTabId } from '../types';

const always = (): boolean => true;

export const SETTINGS_TABS: readonly SettingsTab[] = [
    {
        id: SETTINGS_TAB.plan,
        labelKey: 'tabs.plan',
        visible: (context: SettingsTabContext): boolean => context.mode === SETTINGS_MODE.hosted
    },
    {
        id: SETTINGS_TAB.integrations,
        labelKey: 'tabs.integrations',
        visible: (context: SettingsTabContext): boolean => context.mode === SETTINGS_MODE.selfHosted
    },
    { id: SETTINGS_TAB.people, labelKey: 'tabs.people', visible: always },
    { id: SETTINGS_TAB.whatsapp, labelKey: 'tabs.whatsapp', visible: always },
    { id: SETTINGS_TAB.calendar, labelKey: 'tabs.calendar', visible: always },
    { id: SETTINGS_TAB.banks, labelKey: 'tabs.banks', visible: always },
    { id: SETTINGS_TAB.preferences, labelKey: 'tabs.preferences', visible: always },
    { id: SETTINGS_TAB.privacy, labelKey: 'tabs.privacy', visible: always }
];

export function currentSettingsMode(): SettingsMode {
    return SETTINGS_MODE.hosted;
}

export function visibleSettingsTabs(context: SettingsTabContext): readonly SettingsTab[] {
    return SETTINGS_TABS.filter((tab: SettingsTab): boolean => tab.visible(context));
}

export function firstSettingsTab(context: SettingsTabContext): SettingsTabId {
    return visibleSettingsTabs(context)[0]?.id ?? SETTINGS_TAB.preferences;
}

export function resolveSettingsTab(raw: string, context: SettingsTabContext): SettingsTabId {
    const found: SettingsTab | undefined = visibleSettingsTabs(context).find((tab: SettingsTab): boolean => tab.id === raw);
    return found?.id ?? firstSettingsTab(context);
}
