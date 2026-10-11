export type PluggyTarget = 'meu' | 'dashboard';

export const PLUGGY_LINKS: Readonly<Record<PluggyTarget, string>> = {
    meu: 'https://meu.pluggy.ai',
    dashboard: 'https://dashboard.pluggy.ai'
};

export const PLUGGY_HOSTS: Readonly<Record<PluggyTarget, string>> = {
    meu: 'meu.pluggy.ai',
    dashboard: 'dashboard.pluggy.ai'
};
