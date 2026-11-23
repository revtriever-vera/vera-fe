import type { PeopleState } from '../../lib/people-context';
import type { GoalFormInput } from '../schemas/goal.schema';
import type { GoalView } from '../types';
import { describe, expect, it } from 'vitest';
import { behindTravel, goal, goalHolding } from '../../../../../test/fixtures/goals';
import { addMonthsIso, createBody, emptyFormValues, formValuesOf, nextDayIso, updateBody } from './goal-form-values';

const ALONE: PeopleState = { people: [], multi: false };
const PAIR: PeopleState = { people: [], multi: true };

describe('datas', () => {
    it('soma meses limitando o dia ao fim do mês e virando o ano', () => {
        expect(addMonthsIso('2026-11-23', 12)).toBe('2027-11-23');
        expect(addMonthsIso('2026-01-31', 1)).toBe('2026-02-28');
        expect(addMonthsIso('2026-11-30', 3)).toBe('2027-02-28');
    });

    it('acha o dia seguinte', () => {
        expect(nextDayIso('2026-12-31')).toBe('2027-01-01');
        expect(nextDayIso('2026-02-28')).toBe('2026-03-01');
    });
});

describe('valores do formulário', () => {
    it('a reserva nasce com a data de hoje mais 12 meses e os outros modelos sem data', () => {
        expect(emptyFormValues('emergency_reserve', '2026-11-23', 'Reserva').targetDate).toBe('2027-11-23');
        expect(emptyFormValues('travel', '2026-11-23', 'Viagem').targetDate).toBeNull();
    });

    it('lê um objetivo existente, com o valor fora da carteira vazio quando é zero', () => {
        const values: GoalFormInput = formValuesOf(goal(), 'pt-BR');
        expect(values).toMatchObject({
            name: 'Reserva de emergência',
            targetMinor: 3120000,
            manualMinor: null,
            holder: 'all',
            reserveMonths: 6
        });
        expect(formValuesOf(behindTravel(), 'pt-BR').manualMinor).toBe(100000);
    });
});

describe('corpo do envio', () => {
    it('na criação, só manda o titular com mais de uma pessoa e os meses só na reserva', () => {
        const reserve: GoalFormInput = { ...emptyFormValues('emergency_reserve', '2026-11-23', ' Reserva '), targetMinor: 100 };
        expect(createBody(reserve, ALONE, 'pt-BR')).toEqual({
            kind: 'emergency_reserve',
            name: 'Reserva',
            targetMinor: 100,
            targetDate: '2027-11-23',
            manualMinor: 0,
            reserveMonths: 6,
            holdings: []
        });
        const other: GoalFormInput = {
            ...emptyFormValues('other', '2026-11-23', 'Carro'),
            targetMinor: 100,
            targetDate: '2027-01-01',
            holder: '00000000-0000-4000-8000-000000000002'
        };
        expect(createBody(other, PAIR, 'pt-BR')).toMatchObject({ holderUserId: '00000000-0000-4000-8000-000000000002' });
        expect(createBody(other, PAIR, 'pt-BR')).not.toHaveProperty('reserveMonths');
    });

    it('na edição, não manda nada quando nada mudou', () => {
        const current: GoalView = goal({ holdings: [goalHolding()] });
        expect(updateBody(current, formValuesOf(current, 'pt-BR'), PAIR, 'pt-BR')).toEqual({});
    });

    it('na edição, manda só o que mudou, com titular e meses da reserva', () => {
        const current: GoalView = goal({
            reserve: { months: 6, baseMinor: 520000, averageMinor: null, suggestedMinor: null, deltaBps: null, shouldUpdate: false }
        });
        const values: GoalFormInput = {
            ...formValuesOf(current, 'pt-BR'),
            name: ' Outro nome ',
            targetMinor: 1,
            holder: '00000000-0000-4000-8000-000000000002',
            reserveMonths: 12
        };
        expect(updateBody(current, values, PAIR, 'pt-BR')).toEqual({
            name: 'Outro nome',
            targetMinor: 1,
            holderUserId: '00000000-0000-4000-8000-000000000002',
            reserveMonths: 12
        });
        expect(updateBody(current, values, ALONE, 'pt-BR')).not.toHaveProperty('holderUserId');
    });

    it('numa reserva antiga sem base, manda os meses quando o valor muda', () => {
        const current: GoalView = goal();
        const values: GoalFormInput = { ...formValuesOf(current, 'pt-BR'), targetMinor: 5 };
        expect(updateBody(current, values, ALONE, 'pt-BR')).toEqual({ targetMinor: 5, reserveMonths: 6 });
        expect(updateBody(behindTravel(), formValuesOf(behindTravel(), 'pt-BR'), ALONE, 'pt-BR')).not.toHaveProperty('reserveMonths');
    });
});
