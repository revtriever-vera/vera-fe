import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { emptyFormValues } from '../lib/goal-form-values';
import { createGoalSchema, type GoalFormInput } from './goal.schema';

const t: TFunction<'portfolioGoals'> = i18n.getFixedT('pt-BR', 'portfolioGoals');
const SELIC_KEY: string = 'fixed_income:selic';

function schema(
    originalDate: string | null = null,
    used: ReadonlyMap<string, number> = new Map<string, number>()
): ReturnType<typeof createGoalSchema> {
    return createGoalSchema(t, { today: '2026-11-23', originalDate, locale: 'pt-BR', usedBps: used });
}

function valid(overrides: Partial<GoalFormInput> = {}): GoalFormInput {
    return { ...emptyFormValues('other', '2026-11-23', 'Carro'), targetMinor: 100, targetDate: '2027-01-01', ...overrides };
}

function messages(result: ReturnType<ReturnType<typeof createGoalSchema>['safeParse']>): string[] {
    return result.success ? [] : result.error.issues.map((issue): string => issue.message);
}

describe('goal.schema', () => {
    it('aceita um objetivo completo', () => {
        expect(schema().safeParse(valid()).success).toBe(true);
    });

    it('pede nome, valor e data', () => {
        const result: ReturnType<typeof messages> = messages(
            schema().safeParse(valid({ name: '  ', targetMinor: null, targetDate: null }))
        );
        expect(result).toEqual(expect.arrayContaining(['Dê um nome ao objetivo', 'Informe o valor do objetivo', 'Escolha a data']));
    });

    it('recusa valor zero e nome comprido demais', () => {
        expect(messages(schema().safeParse(valid({ targetMinor: 0 })))).toContain('Informe o valor do objetivo');
        expect(messages(schema().safeParse(valid({ name: 'a'.repeat(61) })))).toContain('Use até 60 caracteres');
    });

    it('exige data depois de hoje, menos quando é a data que o objetivo já tinha', () => {
        expect(messages(schema().safeParse(valid({ targetDate: '2026-11-23' })))).toContain('Escolha uma data depois de hoje');
        expect(schema('2026-10-01').safeParse(valid({ targetDate: '2026-10-01' })).success).toBe(true);
    });

    it('valida a parte de cada ativo contra o que está livre', () => {
        const used: ReadonlyMap<string, number> = new Map<string, number>([[SELIC_KEY, 7000]]);
        expect(schema(null, used).safeParse(valid({ shares: { [SELIC_KEY]: '30' } })).success).toBe(true);
        expect(messages(schema(null, used).safeParse(valid({ shares: { [SELIC_KEY]: '31' } })))).toContain(
            'A parte passa do que está livre neste ativo'
        );
        expect(messages(schema().safeParse(valid({ shares: { [SELIC_KEY]: '0' } })))).toContain('Informe uma parte entre 0,01% e 100%');
        expect(schema().safeParse(valid({ shares: { [SELIC_KEY]: '  ' } })).success).toBe(true);
    });
});
