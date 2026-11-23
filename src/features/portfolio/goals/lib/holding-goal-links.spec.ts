import { describe, expect, it } from 'vitest';
import { behindTravel, goal, goalHolding } from '../../../../../test/fixtures/goals';
import type { GoalView } from '../types';
import { hasBehindGoalWithHolding } from './behind-goals';
import { holdingGoalLinks } from './holding-goal-links';

describe('holdingGoalLinks', () => {
    it('junta os objetivos que usam o ativo, com a parte de cada um', () => {
        const reserve: GoalView = goal({ holdings: [goalHolding({ holdingId: 'h-1', shareBps: 6000 })] });
        const travel: GoalView = behindTravel({ holdings: [goalHolding({ holdingId: 'h-1', shareBps: 2500 })] });

        expect(holdingGoalLinks([reserve, travel], 'fixed_income', 'h-1')).toEqual([
            { goalId: reserve.id, name: 'Reserva de emergência', kind: 'emergency_reserve', shareBps: 6000 },
            { goalId: travel.id, name: 'Viagem', kind: 'travel', shareBps: 2500 }
        ]);
    });

    it('não confunde o tipo do ativo, ignora vínculo removido e outro ativo', () => {
        const reserve: GoalView = goal({
            holdings: [goalHolding({ holdingId: 'h-1' }), goalHolding({ holdingId: 'h-2', removed: true })]
        });

        expect(holdingGoalLinks([reserve], 'position', 'h-1')).toEqual([]);
        expect(holdingGoalLinks([reserve], 'fixed_income', 'h-2')).toEqual([]);
        expect(holdingGoalLinks([reserve], 'fixed_income', 'h-3')).toEqual([]);
    });
});

describe('hasBehindGoalWithHolding', () => {
    it('só vale para atrasado ou vencido com algum ativo vinculado', () => {
        expect(hasBehindGoalWithHolding([goal()])).toBe(false);
        expect(hasBehindGoalWithHolding([behindTravel()])).toBe(true);
        expect(hasBehindGoalWithHolding([behindTravel({ status: 'overdue' })])).toBe(true);
        expect(hasBehindGoalWithHolding([behindTravel({ holdings: [] })])).toBe(false);
        expect(hasBehindGoalWithHolding([behindTravel({ holdings: [goalHolding({ removed: true })] })])).toBe(false);
    });
});
