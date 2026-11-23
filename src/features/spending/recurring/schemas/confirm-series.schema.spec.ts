import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import {
    createConfirmSeriesSchema,
    hasExpectedDay,
    toConfirmBody,
    type ConfirmSeriesFormInput,
    type ConfirmSeriesSchema
} from './confirm-series.schema';

const schema: ConfirmSeriesSchema = createConfirmSeriesSchema(i18n.getFixedT('pt-BR', 'spendingRecurring'));

function input(overrides: Partial<ConfirmSeriesFormInput> = {}): ConfirmSeriesFormInput {
    return {
        name: 'Netflix',
        cadence: 'monthly',
        expectedDay: '12',
        kind: 'subscription',
        categoryId: '',
        createRule: false,
        ...overrides
    };
}

describe('createConfirmSeriesSchema', () => {
    it('aceita uma série mensal com dia', () => {
        expect(schema.safeParse(input()).success).toBe(true);
    });

    it.each(['', '0', '32', 'abc', '1.5'])('recusa o dia %j numa série mensal', (expectedDay: string) => {
        const result: ReturnType<ConfirmSeriesSchema['safeParse']> = schema.safeParse(input({ expectedDay }));

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.path).toEqual(['expectedDay']);
        expect(result.error?.issues[0]?.message).toBe('Informe um dia de 1 a 31');
    });

    it('não exige dia na série semanal', () => {
        expect(schema.safeParse(input({ cadence: 'weekly', expectedDay: '' })).success).toBe(true);
    });

    it('recusa nome vazio e nome com mais de 80 caracteres', () => {
        expect(schema.safeParse(input({ name: '   ' })).error?.issues[0]?.message).toBe('Informe o nome');
        expect(schema.safeParse(input({ name: 'a'.repeat(81) })).error?.issues[0]?.message).toBe('Use até 80 caracteres');
    });
});

describe('hasExpectedDay', () => {
    it('é falso para semanal e quinzenal', () => {
        expect(hasExpectedDay('weekly')).toBe(false);
        expect(hasExpectedDay('biweekly')).toBe(false);
        expect(hasExpectedDay('annual')).toBe(true);
    });
});

describe('toConfirmBody', () => {
    it('manda o dia como número e omite a categoria sem regra', () => {
        expect(toConfirmBody(input({ name: ' Netflix ', categoryId: 'c-1' }))).toEqual({
            name: 'Netflix',
            cadence: 'monthly',
            expectedDay: 12,
            kind: 'subscription'
        });
    });

    it('manda categoria e regra quando "sempre para" está marcado', () => {
        expect(toConfirmBody(input({ categoryId: 'c-1', createRule: true }))).toMatchObject({ categoryId: 'c-1', createRule: true });
    });

    it('manda dia nulo na série semanal', () => {
        expect(toConfirmBody(input({ cadence: 'weekly', expectedDay: '' })).expectedDay).toBeNull();
    });
});
