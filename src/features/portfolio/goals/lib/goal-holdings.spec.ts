import { describe, expect, it } from 'vitest';
import type { GoalHoldingBody, GoalView } from '../types';
import { goal, goalHolding } from '../../../../../test/fixtures/goals';
import { bodyHoldings, freeBpsOf, holdingKey, sameHoldings, sharesFromHoldings, usedBpsByHolding, type ShareTexts } from './goal-holdings';

const SELIC: string = '00000000-0000-4000-8000-0000000000c1';

describe('goal-holdings', () => {
    it('soma o que os outros objetivos já usam do mesmo ativo e ignora o que está sendo editado', () => {
        const goals: GoalView[] = [
            goal({ id: 'a', holdings: [goalHolding({ holdingId: SELIC, shareBps: 6000 })] }),
            goal({ id: 'b', holdings: [goalHolding({ holdingId: SELIC, shareBps: 3000 })] })
        ];
        const key: string = holdingKey('fixed_income', SELIC);
        expect(freeBpsOf(usedBpsByHolding(goals, null), key)).toBe(1000);
        expect(freeBpsOf(usedBpsByHolding(goals, 'a'), key)).toBe(7000);
        expect(freeBpsOf(usedBpsByHolding([], null), key)).toBe(10000);
    });

    it('nunca devolve parte livre negativa', () => {
        const goals: GoalView[] = [
            goal({ holdings: [goalHolding({ holdingId: SELIC, shareBps: 10000 })] }),
            goal({ id: 'b', holdings: [goalHolding({ holdingId: SELIC, shareBps: 500 })] })
        ];
        expect(freeBpsOf(usedBpsByHolding(goals, null), holdingKey('fixed_income', SELIC))).toBe(0);
    });

    it('lê as partes em texto e descarta vazias, zero e inválidas', () => {
        const texts: Record<string, string> = {
            [holdingKey('fixed_income', SELIC)]: '60,5',
            [holdingKey('position', 'x')]: '',
            [holdingKey('position', 'y')]: '0',
            [holdingKey('position', 'z')]: 'abc',
            'cripto:w': '10'
        };
        expect(bodyHoldings(texts, 'pt-BR')).toEqual([{ kind: 'fixed_income', holdingId: SELIC, shareBps: 6050 }]);
    });

    it('monta os textos dos ativos vinculados, sem os removidos', () => {
        const texts: ShareTexts = sharesFromHoldings(
            [goalHolding({ holdingId: SELIC, shareBps: 2500 }), goalHolding({ holdingId: 'gone', removed: true })],
            (bps: number): string => String(bps / 100)
        );
        expect(texts).toEqual({ [holdingKey('fixed_income', SELIC)]: '25' });
    });

    it('compara listas sem depender da ordem', () => {
        const a: GoalHoldingBody = { kind: 'position', holdingId: '1', shareBps: 100 };
        const b: GoalHoldingBody = { kind: 'fixed_income', holdingId: '2', shareBps: 200 };
        expect(sameHoldings([a, b], [b, a])).toBe(true);
        expect(sameHoldings([a], [{ ...a, shareBps: 101 }])).toBe(false);
    });
});
