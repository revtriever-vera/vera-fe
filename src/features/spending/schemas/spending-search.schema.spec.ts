import { describe, expect, it } from 'vitest';
import { layoutSearchSchema, monthSearchSchema, transactionsSearchSchema } from './spending-search.schema';

describe('layoutSearchSchema', () => {
    it('aceita importar como booleano', () => {
        expect(layoutSearchSchema.parse({ import: true })).toEqual({ import: true });
    });

    it('descarta um valor inválido sem lançar', () => {
        expect(layoutSearchSchema.parse({ import: 'talvez' })).toEqual({});
    });
});

describe('monthSearchSchema', () => {
    it('aceita AAAA-MM', () => {
        expect(monthSearchSchema.parse({ month: '2026-09' })).toEqual({ month: '2026-09' });
    });

    it.each(['abc', '2026-13', '2026-9', '2026-00', 202609])('descarta %s sem lançar', (month: string | number) => {
        expect(monthSearchSchema.parse({ month })).toEqual({});
    });
});

describe('transactionsSearchSchema', () => {
    it('aceita todos os filtros', () => {
        const search: Record<string, unknown> = {
            month: '2026-09',
            accountId: 'acc-1',
            categoryId: 'cat-1',
            uncategorized: true,
            direction: 'out',
            q: 'padaria',
            page: 2
        };

        expect(transactionsSearchSchema.parse(search)).toEqual(search);
    });

    it('descarta direção e página inválidas', () => {
        expect(transactionsSearchSchema.parse({ direction: 'sideways', page: 0 })).toEqual({});
        expect(transactionsSearchSchema.parse({ page: 1.5 })).toEqual({});
    });

    it('a busca numérica vira texto', () => {
        expect(transactionsSearchSchema.parse({ q: 123 })).toEqual({ q: '123' });
    });
});
