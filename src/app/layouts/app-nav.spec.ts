import { PieChart } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { activeNavId, APP_NAV_ITEMS, type NavItem } from './app-nav';

const ITEMS: readonly NavItem[] = [
    { id: 'overview', to: '/portfolio', labelKey: 'navPortfolioOverview', icon: PieChart },
    { id: 'assets', to: '/portfolio/assets', labelKey: 'navPortfolioAssets', icon: PieChart }
];

describe('activeNavId', () => {
    it('picks the most specific item', () => {
        expect(activeNavId('/portfolio/assets', ITEMS)).toBe('assets');
        expect(activeNavId('/portfolio/assets/42', ITEMS)).toBe('assets');
        expect(activeNavId('/portfolio', ITEMS)).toBe('overview');
    });

    it('returns null outside the menu', () => {
        expect(activeNavId('/outra', ITEMS)).toBeNull();
        expect(activeNavId('/portfolioX', ITEMS)).toBeNull();
    });
});

describe('APP_NAV_ITEMS', () => {
    it('has unique ids and paths', () => {
        expect(new Set(APP_NAV_ITEMS.map((item: NavItem): string => item.id)).size).toBe(APP_NAV_ITEMS.length);
        expect(new Set(APP_NAV_ITEMS.map((item: NavItem): string => item.to)).size).toBe(APP_NAV_ITEMS.length);
    });
});

describe('grupo Gastos', () => {
    const spending: readonly NavItem[] = APP_NAV_ITEMS.filter((item: NavItem): boolean => item.group === 'spending');

    it('tem os quatro itens, na ordem do menu', () => {
        expect(spending.map((item: NavItem): string => item.to)).toEqual([
            '/spending',
            '/spending/transactions',
            '/spending/cuts',
            '/spending/connections'
        ]);
    });

    it('só Transações carrega o contador de sem categoria', () => {
        expect(spending.filter((item: NavItem): boolean => item.badge !== undefined).map((item: NavItem): string => item.id)).toEqual([
            'spending-transactions'
        ]);
    });

    it('marca o item mais específico em cada rota de gastos e nenhum em Regras', () => {
        expect(activeNavId('/spending', APP_NAV_ITEMS)).toBe('spending-summary');
        expect(activeNavId('/spending/transactions', APP_NAV_ITEMS)).toBe('spending-transactions');
        expect(activeNavId('/spending/connections', APP_NAV_ITEMS)).toBe('spending-connections');
        expect(activeNavId('/spending/rules', APP_NAV_ITEMS)).toBeNull();
    });
});
