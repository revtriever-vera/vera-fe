import { describe, expect, it } from 'vitest';
import { agendaItem } from '../../../../../test/fixtures/agenda';
import type { AgendaItem } from '../types';
import { applyAgendaFilter, filterOfKind, isMaturity } from './agenda-filter';

describe('filtro da agenda', () => {
    const items: AgendaItem[] = [
        agendaItem({ id: 'a', kind: 'fii_income' }),
        agendaItem({ id: 'b', kind: 'assembly' }),
        agendaItem({ id: 'c', kind: 'treasury_maturity' }),
        agendaItem({ id: 'd', kind: 'earnings_release' })
    ];

    it('sem filtro devolve tudo', () => {
        expect(applyAgendaFilter(items, undefined)).toHaveLength(4);
    });

    it('agrupa resultados com assembleias', () => {
        expect(applyAgendaFilter(items, 'assembly').map((item) => item.id)).toEqual(['b', 'd']);
    });

    it('classifica cada tipo', () => {
        expect(filterOfKind('jcp')).toBe('income');
        expect(isMaturity('fixed_income_maturity')).toBe(true);
        expect(isMaturity('dividend')).toBe(false);
    });
});
