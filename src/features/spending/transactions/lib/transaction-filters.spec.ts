import { describe, expect, it } from 'vitest';
import {
    TRANSACTIONS_PAGE_SIZE,
    clearedFilters,
    filtersToQuery,
    hasActiveFilters,
    pageQuery,
    secondaryFilterCount,
    withFilter,
    withPage
} from './transaction-filters';

describe('withFilter', () => {
    it('trocar um filtro zera a página', () => {
        expect(withFilter({ month: '2026-09', page: 3 }, { direction: 'out' })).toEqual({ month: '2026-09', direction: 'out' });
    });

    it('trocar o mês também volta para a primeira página', () => {
        expect(withFilter({ month: '2026-09', page: 2 }, { month: '2026-08' })).toEqual({ month: '2026-08' });
    });

    it('categoryId e uncategorized não coexistem', () => {
        expect(withFilter({ categoryId: 'cat-a' }, { uncategorized: true })).toEqual({ uncategorized: true });
        expect(withFilter({ uncategorized: true }, { categoryId: 'cat-b' })).toEqual({ categoryId: 'cat-b' });
    });

    it('limpa o filtro quando o valor volta a ser indefinido e descarta busca em branco', () => {
        expect(withFilter({ accountId: 'acc-1', q: 'pix' }, { accountId: undefined })).toEqual({ q: 'pix' });
        expect(withFilter({ q: 'pix' }, { q: '   ' })).toEqual({});
    });

    it('apara a busca', () => {
        expect(withFilter({}, { q: ' padaria ' })).toEqual({ q: 'padaria' });
    });
});

describe('withPage', () => {
    it('a primeira página sai da URL', () => {
        expect(withPage({ month: '2026-09', page: 4 }, 1)).toEqual({ month: '2026-09' });
        expect(withPage({ month: '2026-09' }, 3)).toEqual({ month: '2026-09', page: 3 });
    });
});

describe('filtersToQuery', () => {
    it('não leva page, nem para a exportação', () => {
        expect(filtersToQuery({ month: '2026-09', page: 2, direction: 'in' })).toEqual({ month: '2026-09', direction: 'in' });
    });

    it('uncategorized vira "true" e vence categoryId', () => {
        expect(filtersToQuery({ uncategorized: true, categoryId: 'cat-a' })).toEqual({ uncategorized: 'true' });
    });

    it('só envia a busca com dois caracteres ou mais, até 60', () => {
        expect(filtersToQuery({ q: 'p' })).toEqual({});
        expect(filtersToQuery({ q: 'pix' })).toEqual({ q: 'pix' });
        expect(filtersToQuery({ q: 'x'.repeat(80) }).q).toHaveLength(60);
    });
});

describe('pageQuery', () => {
    it('acrescenta a página e o tamanho de 50', () => {
        expect(pageQuery({ month: '2026-09' })).toEqual({ month: '2026-09', page: 1, pageSize: TRANSACTIONS_PAGE_SIZE });
        expect(pageQuery({ page: 2 }).page).toBe(2);
    });
});

describe('filtros ativos', () => {
    it('o mês sozinho não é filtro', () => {
        expect(hasActiveFilters({ month: '2026-09' })).toBe(false);
        expect(hasActiveFilters({ q: 'pix' })).toBe(true);
        expect(hasActiveFilters({ uncategorized: true })).toBe(true);
    });

    it('conta só os filtros secundários', () => {
        expect(secondaryFilterCount({ accountId: 'a', direction: 'in', q: 'x' })).toBe(2);
        expect(secondaryFilterCount({ uncategorized: true })).toBe(1);
        expect(secondaryFilterCount({})).toBe(0);
    });

    it('limpar mantém só o mês', () => {
        expect(clearedFilters({ month: '2026-09', q: 'x', page: 2, direction: 'out' })).toEqual({ month: '2026-09' });
        expect(clearedFilters({ q: 'x' })).toEqual({});
    });
});
