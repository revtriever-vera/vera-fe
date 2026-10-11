import { describe, expect, it } from 'vitest';
import { portfolioKeys } from './portfolio-keys';

describe('portfolioKeys', () => {
    it('todas as chaves partem da raiz portfolio', () => {
        expect(portfolioKeys.settings()).toEqual(['portfolio', 'settings']);
        expect(portfolioKeys.classes()).toEqual(['portfolio', 'classes']);
        expect(portfolioKeys.holdings()).toEqual(['portfolio', 'holdings']);
        expect(portfolioKeys.overview()).toEqual(['portfolio', 'overview']);
    });

    it('o detalhe de classe e o aporte carregam o parâmetro', () => {
        expect(portfolioKeys.classDetail('c-1')).toEqual(['portfolio', 'class-detail', 'c-1']);
        expect(portfolioKeys.contribution(150000)).toEqual(['portfolio', 'contribution', 150000]);
    });

    it('a busca, as cotações, o câmbio e a prévia de renda fixa entram na chave', () => {
        expect(portfolioKeys.catalogSearch({ group: 'acoes_br', q: 'itau' })).toEqual([
            'portfolio',
            'catalog-search',
            { group: 'acoes_br', q: 'itau' }
        ]);
        expect(portfolioKeys.quotes(['a', 'b'])).toEqual(['portfolio', 'quotes', ['a', 'b']]);
        expect(portfolioKeys.exchangeRate('USD')).toEqual(['portfolio', 'exchange-rate', 'USD']);
        expect(portfolioKeys.fixedIncomePreview({ amountMinor: 100 })).toEqual(['portfolio', 'fixed-income-preview', { amountMinor: 100 }]);
    });

    it('as chaves de detalhe e de aporte ficam sob o prefixo geral da família', () => {
        expect(portfolioKeys.classDetail('c-1').slice(0, 2)).toEqual(portfolioKeys.classDetails());
        expect(portfolioKeys.contribution(1).slice(0, 2)).toEqual(portfolioKeys.contributions());
    });
});
