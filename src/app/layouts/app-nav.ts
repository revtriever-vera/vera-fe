import type ptBRCommon from '@/shared/lib/i18n/resources/pt-BR/common.json';
import { List, PieChart, Plug, Receipt, Scissors, Target, Wallet, Zap, type LucideIcon } from 'lucide-react';

export type NavGroup = 'portfolio' | 'spending' | 'settings';

export type NavLabelKey = keyof typeof ptBRCommon;

export type NavBadge = 'spendingUncategorized';

export interface NavItem {
    readonly id: string;
    readonly to: string;
    readonly labelKey: NavLabelKey;
    readonly icon: LucideIcon;
    readonly group?: NavGroup;
    readonly badge?: NavBadge;
    readonly exact?: boolean;
}

export const APP_NAV_ITEMS: readonly NavItem[] = [
    { id: 'portfolio-overview', to: '/portfolio', labelKey: 'navPortfolioOverview', icon: PieChart, group: 'portfolio' },
    { id: 'portfolio-assets', to: '/portfolio/assets', labelKey: 'navPortfolioAssets', icon: Wallet, group: 'portfolio' },
    { id: 'portfolio-targets', to: '/portfolio/targets', labelKey: 'navPortfolioTargets', icon: Target, group: 'portfolio' },
    { id: 'portfolio-contribution', to: '/portfolio/contribution', labelKey: 'navPortfolioContribution', icon: Zap, group: 'portfolio' },
    { id: 'spending-summary', to: '/spending', labelKey: 'navSpendingSummary', icon: Receipt, group: 'spending', exact: true },
    {
        id: 'spending-transactions',
        to: '/spending/transactions',
        labelKey: 'navSpendingTransactions',
        icon: List,
        group: 'spending',
        badge: 'spendingUncategorized'
    },
    { id: 'spending-cuts', to: '/spending/cuts', labelKey: 'navSpendingCuts', icon: Scissors, group: 'spending' },
    { id: 'spending-connections', to: '/spending/connections', labelKey: 'navSpendingConnections', icon: Plug, group: 'spending' }
];

export function activeNavId(pathname: string, items: readonly NavItem[]): string | null {
    const matches: readonly NavItem[] = items.filter(
        (item: NavItem): boolean => pathname === item.to || (item.exact !== true && pathname.startsWith(`${item.to}/`))
    );
    const best: NavItem | undefined = [...matches].sort((a: NavItem, b: NavItem): number => b.to.length - a.to.length)[0];
    return best?.id ?? null;
}
