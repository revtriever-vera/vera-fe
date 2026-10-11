export type PluggyTarget = 'meu' | 'dashboard' | 'github';

export const PLUGGY_LINKS: Readonly<Record<PluggyTarget, string>> = {
    meu: 'https://meu.pluggy.ai',
    dashboard: 'https://dashboard.pluggy.ai',
    github: 'https://github.com/pluggyai/meu-pluggy'
};

export const PLUGGY_HOSTS: Readonly<Record<PluggyTarget, string>> = {
    meu: 'meu.pluggy.ai',
    dashboard: 'dashboard.pluggy.ai',
    github: 'github.com'
};
