import { describe, expect, it } from 'vitest';
import { portfolioKeys } from './portfolio-keys';

describe('portfolioKeys', () => {
    it('todas as chaves partem da raiz portfolio', () => {
        expect(portfolioKeys.settings()).toEqual(['portfolio', 'settings']);
        expect(portfolioKeys.classes()).toEqual(['portfolio', 'classes']);
        expect(portfolioKeys.holdings()).toEqual(['portfolio', 'holdings']);
        expect(portfolioKeys.overview()).toEqual(['portfolio', 'overview']);
        expect(portfolioKeys.concentration()).toEqual(['portfolio', 'concentration']);
    });

    it('o detalhe de classe e o aporte carregam o parâmetro', () => {
        expect(portfolioKeys.classDetail('c-1')).toEqual(['portfolio', 'class-detail', 'c-1']);
        expect(portfolioKeys.contribution(150000)).toEqual(['portfolio', 'contribution', 150000, true]);
        expect(portfolioKeys.contribution(150000, false)).toEqual(['portfolio', 'contribution', 150000, false]);
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

    it('a posição carrega o id', () => {
        expect(portfolioKeys.position('p-1')).toEqual(['portfolio', 'position', 'p-1']);
    });

    it('as chaves de detalhe e de aporte ficam sob o prefixo geral da família', () => {
        expect(portfolioKeys.classDetail('c-1').slice(0, 2)).toEqual(portfolioKeys.classDetails());
        expect(portfolioKeys.contribution(1).slice(0, 2)).toEqual(portfolioKeys.contributions());
    });

    it('o titular entra na chave de leitura, sob o prefixo geral', () => {
        expect(portfolioKeys.holdingsOf(undefined)).toEqual(['portfolio', 'holdings', 'any']);
        expect(portfolioKeys.overviewOf('all')).toEqual(['portfolio', 'overview', 'all']);
        expect(portfolioKeys.classDetailOf('c-1', 'u-1')).toEqual(['portfolio', 'class-detail', 'c-1', 'u-1']);
        expect(portfolioKeys.holdingsOf('u-1').slice(0, 2)).toEqual(portfolioKeys.holdings());
        expect(portfolioKeys.classDetailOf('c-1', 'u-1').slice(0, 3)).toEqual(portfolioKeys.classDetail('c-1'));
    });
});
