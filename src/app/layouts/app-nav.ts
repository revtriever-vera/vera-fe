import type ptBRCommon from '@/shared/lib/i18n/resources/pt-BR/common.json';
import { PieChart, Target, Wallet, Zap, type LucideIcon } from 'lucide-react';

export type NavGroup = 'portfolio' | 'spending' | 'settings';

export type NavLabelKey = keyof typeof ptBRCommon;

export interface NavItem {
    readonly id: string;
    readonly to: string;
    readonly labelKey: NavLabelKey;
    readonly icon: LucideIcon;
    readonly group?: NavGroup;
}

export const APP_NAV_ITEMS: readonly NavItem[] = [
    { id: 'portfolio-overview', to: '/patrimonio', labelKey: 'navPortfolioOverview', icon: PieChart, group: 'portfolio' },
    { id: 'portfolio-assets', to: '/patrimonio/ativos', labelKey: 'navPortfolioAssets', icon: Wallet, group: 'portfolio' },
    { id: 'portfolio-targets', to: '/patrimonio/carteira-alvo', labelKey: 'navPortfolioTargets', icon: Target, group: 'portfolio' },
    { id: 'portfolio-contribution', to: '/patrimonio/aporte', labelKey: 'navPortfolioContribution', icon: Zap, group: 'portfolio' }
];

export function activeNavId(pathname: string, items: readonly NavItem[]): string | null {
    const matches: readonly NavItem[] = items.filter(
        (item: NavItem): boolean => pathname === item.to || pathname.startsWith(`${item.to}/`)
    );
    const best: NavItem | undefined = [...matches].sort((a: NavItem, b: NavItem): number => b.to.length - a.to.length)[0];
    return best?.id ?? null;
}
