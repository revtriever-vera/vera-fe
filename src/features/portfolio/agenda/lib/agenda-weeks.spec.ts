import { describe, expect, it } from 'vitest';
import { agendaItem } from '../../../../../test/fixtures/agenda';
import { groupByWeek, weekStartOf, type AgendaWeek } from './agenda-weeks';

describe('weekStartOf', () => {
    it('devolve a segunda-feira da semana', () => {
        expect(weekStartOf('2026-12-02')).toBe('2026-11-30');
        expect(weekStartOf('2026-11-30')).toBe('2026-11-30');
        expect(weekStartOf('2026-12-06')).toBe('2026-11-30');
        expect(weekStartOf('2026-12-07')).toBe('2026-12-07');
    });
});

describe('groupByWeek', () => {
    it('agrupa por semana mantendo a ordem de chegada', () => {
        const weeks: readonly AgendaWeek[] = groupByWeek([
            agendaItem({ id: 'a', date: '2026-12-01' }),
            agendaItem({ id: 'b', date: '2026-12-03' }),
            agendaItem({ id: 'c', date: '2026-12-09' })
        ]);
        expect(weeks.map((week) => week.start)).toEqual(['2026-11-30', '2026-12-07']);
        expect(weeks[0]?.items.map((item) => item.id)).toEqual(['a', 'b']);
    });

    it('lista vazia não gera semana', () => {
        expect(groupByWeek([])).toEqual([]);
    });
});
