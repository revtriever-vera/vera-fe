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
    { id: 'portfolio-overview', to: '/patrimonio', labelKey: 'navPortfolioOverview', icon: PieChart, group: 'portfolio' },
    { id: 'portfolio-assets', to: '/patrimonio/ativos', labelKey: 'navPortfolioAssets', icon: Wallet, group: 'portfolio' },
    { id: 'portfolio-targets', to: '/patrimonio/carteira-alvo', labelKey: 'navPortfolioTargets', icon: Target, group: 'portfolio' },
    { id: 'portfolio-contribution', to: '/patrimonio/aporte', labelKey: 'navPortfolioContribution', icon: Zap, group: 'portfolio' },
    { id: 'spending-summary', to: '/gastos', labelKey: 'navSpendingSummary', icon: Receipt, group: 'spending', exact: true },
    {
        id: 'spending-transactions',
        to: '/gastos/transacoes',
        labelKey: 'navSpendingTransactions',
        icon: List,
        group: 'spending',
        badge: 'spendingUncategorized'
    },
    { id: 'spending-cuts', to: '/gastos/cortes', labelKey: 'navSpendingCuts', icon: Scissors, group: 'spending' },
    { id: 'spending-connections', to: '/gastos/conexoes', labelKey: 'navSpendingConnections', icon: Plug, group: 'spending' }
];

export function activeNavId(pathname: string, items: readonly NavItem[]): string | null {
    const matches: readonly NavItem[] = items.filter(
        (item: NavItem): boolean => pathname === item.to || (item.exact !== true && pathname.startsWith(`${item.to}/`))
    );
    const best: NavItem | undefined = [...matches].sort((a: NavItem, b: NavItem): number => b.to.length - a.to.length)[0];
    return best?.id ?? null;
}
