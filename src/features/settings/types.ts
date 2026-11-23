export const SETTINGS_TAB = {
    plan: 'plan',
    integrations: 'integrations',
    people: 'people',
    whatsapp: 'whatsapp',
    calendar: 'calendar',
    banks: 'banks',
    preferences: 'preferences',
    privacy: 'privacy'
} as const;

export type SettingsTabId = (typeof SETTINGS_TAB)[keyof typeof SETTINGS_TAB];

export const SETTINGS_MODE = {
    hosted: 'hosted',
    selfHosted: 'self_hosted'
} as const;

export type SettingsMode = (typeof SETTINGS_MODE)[keyof typeof SETTINGS_MODE];

export interface SettingsTabContext {
    readonly mode: SettingsMode;
}

export type SettingsTabLabelKey =
    | 'tabs.plan'
    | 'tabs.integrations'
    | 'tabs.people'
    | 'tabs.whatsapp'
    | 'tabs.calendar'
    | 'tabs.banks'
    | 'tabs.preferences'
    | 'tabs.privacy';

export interface SettingsTab {
    readonly id: SettingsTabId;
    readonly labelKey: SettingsTabLabelKey;
    readonly visible: (context: SettingsTabContext) => boolean;
}
