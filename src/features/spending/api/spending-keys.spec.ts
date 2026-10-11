import { describe, expect, it } from 'vitest';
import { spendingKeys } from './spending-keys';

describe('spendingKeys', () => {
    it('todas as chaves partem da raiz spending', () => {
        expect(spendingKeys.categories()).toEqual(['spending', 'categories']);
        expect(spendingKeys.rules()).toEqual(['spending', 'rules']);
        expect(spendingKeys.accounts()).toEqual(['spending', 'accounts']);
        expect(spendingKeys.uncategorizedCount()).toEqual(['spending', 'uncategorized-count']);
        expect(spendingKeys.settings()).toEqual(['spending', 'settings']);
        expect(spendingKeys.connections()).toEqual(['spending', 'connections']);
        expect(spendingKeys.credentials()).toEqual(['spending', 'credentials']);
    });

    it('os filtros, o mês, a meta e a página entram na chave', () => {
        expect(spendingKeys.transactions({ month: '2026-09', page: 2 })).toEqual([
            'spending',
            'transactions',
            { month: '2026-09', page: 2 }
        ]);
        expect(spendingKeys.summary('2026-09')).toEqual(['spending', 'summary', '2026-09']);
        expect(spendingKeys.summary(null)).toEqual(['spending', 'summary', null]);
        expect(spendingKeys.cuts('2026-09', 3500)).toEqual(['spending', 'cuts', '2026-09', 3500]);
        expect(spendingKeys.imports(3)).toEqual(['spending', 'imports', 3]);
        expect(spendingKeys.rulePreview({ matchType: 'contains', pattern: 'padaria', appliesTo: 'out' })).toEqual([
            'spending',
            'rule-preview',
            { matchType: 'contains', pattern: 'padaria', appliesTo: 'out' }
        ]);
    });

    it('as chaves de lista são prefixo das chaves com parâmetro', () => {
        expect(spendingKeys.transactions({})).toEqual(expect.arrayContaining([...spendingKeys.transactionLists()]));
        expect(spendingKeys.summary('2026-09')).toEqual(expect.arrayContaining([...spendingKeys.summaries()]));
        expect(spendingKeys.cuts(null, null)).toEqual(expect.arrayContaining([...spendingKeys.cutsList()]));
        expect(spendingKeys.imports(1)).toEqual(expect.arrayContaining([...spendingKeys.importLists()]));
    });
});
