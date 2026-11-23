import { describe, expect, it } from 'vitest';
import { calendarEntry } from '../../../../../test/fixtures/recurring';
import type { CalendarEntry } from '../types';
import { groupByWeek, monthGrids, sortByDate, type MonthGrid, type WeekGroup } from './calendar-groups';

describe('calendar-groups', () => {
    it('agrupa por semana de segunda a domingo, em ordem', () => {
        const weeks: readonly WeekGroup[] = groupByWeek([
            calendarEntry({ date: '2026-12-02' }),
            calendarEntry({ date: '2026-11-29' }),
            calendarEntry({ date: '2026-11-25' })
        ]);

        expect(weeks.map((week) => [week.start, week.end, week.entries.length])).toEqual([
            ['2026-11-23', '2026-11-29', 2],
            ['2026-11-30', '2026-12-06', 1]
        ]);
    });

    it('ordena por data sem mexer na lista original', () => {
        const input: CalendarEntry[] = [calendarEntry({ date: '2026-12-02' }), calendarEntry({ date: '2026-11-25' })];

        expect(sortByDate(input).map((entry) => entry.date)).toEqual(['2026-11-25', '2026-12-02']);
        expect(input[0]?.date).toBe('2026-12-02');
    });

    it('monta uma grade por mês com o deslocamento do primeiro dia', () => {
        const grids: readonly MonthGrid[] = monthGrids([calendarEntry({ date: '2026-11-25' }), calendarEntry({ date: '2027-01-03' })]);

        expect(grids.map((grid) => grid.month)).toEqual(['2026-11', '2026-12', '2027-01']);
        expect(grids[0]?.leading).toBe(6);
        expect(grids[0]?.days).toHaveLength(30);
        expect(grids[0]?.days[24]?.entries).toHaveLength(1);
    });

    it('não monta grade sem débitos', () => {
        expect(monthGrids([])).toEqual([]);
    });
});
