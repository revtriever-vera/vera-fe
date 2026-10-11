import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import type { z, ZodIssue } from 'zod';
import { i18n } from '@/shared/lib/i18n';
import { createPositionSchema, createQuantitySchema, type PositionFormInput } from './position.schema';

const t: TFunction<'portfolioAssets'> = i18n.getFixedT('pt-BR', 'portfolioAssets');

function messages(result: { success: boolean; error?: { issues: ZodIssue[] } }): string[] {
    return result.error?.issues.map((issue: ZodIssue): string => issue.message) ?? [];
}

describe('createQuantitySchema', () => {
    it('recusa casas decimais acima do limite do ativo', () => {
        const schema: z.ZodType<string> = createQuantitySchema(t, 0);

        expect(messages(schema.safeParse('2000.5'))).toEqual(['Este ativo só aceita quantidades inteiras.']);
        expect(schema.safeParse('2000').success).toBe(true);
    });

    it('aceita duas casas no Tesouro e recusa três', () => {
        const schema: z.ZodType<string> = createQuantitySchema(t, 2);

        expect(schema.safeParse('3.2').success).toBe(true);
        expect(messages(schema.safeParse('3.205'))).toEqual(['Este ativo aceita até 2 casas decimais.']);
    });

    it('aceita oito casas na cripto e a vírgula como separador', () => {
        const schema: z.ZodType<string> = createQuantitySchema(t, 8);

        expect(schema.safeParse('0.45').success).toBe(true);
        expect(schema.parse('0,45')).toBe('0.45');
        expect(messages(createQuantitySchema(t, 1).safeParse('1.25'))).toEqual(['Este ativo aceita até 1 casa decimal.']);
    });

    it('recusa vazio, negativo e texto', () => {
        const schema: z.ZodType<string> = createQuantitySchema(t, 8);

        expect(messages(schema.safeParse(''))).toEqual(['Informe a quantidade.']);
        expect(messages(schema.safeParse('-1'))).toEqual(['Use só números, sem sinal negativo.']);
        expect(messages(schema.safeParse('abc'))).toEqual(['Use só números, sem sinal negativo.']);
        expect(messages(schema.safeParse('1234567890123456789'))).toEqual(['Use só números, sem sinal negativo.']);
    });

    it('traduz a mensagem para o inglês', () => {
        const schema: z.ZodType<string> = createQuantitySchema(i18n.getFixedT('en', 'portfolioAssets'), 0);

        expect(messages(schema.safeParse('1.5'))).toEqual(['This asset only accepts whole quantities.']);
    });
});

describe('createPositionSchema', () => {
    const schema: z.ZodType<PositionFormInput> = createPositionSchema(t, 0);

    it('exige a classe', () => {
        const result: z.SafeParseReturnType<PositionFormInput, PositionFormInput> = schema.safeParse({
            quantity: '10',
            averagePrice: '',
            classId: ''
        });

        expect(messages(result)).toEqual(['Escolha a classe do ativo.']);
    });

    it('aceita preço médio vazio ou válido e recusa inválido', () => {
        expect(schema.safeParse({ quantity: '10', averagePrice: '', classId: 'c' }).success).toBe(true);
        expect(schema.safeParse({ quantity: '10', averagePrice: '37,8', classId: 'c' }).success).toBe(true);
        expect(messages(schema.safeParse({ quantity: '10', averagePrice: 'x', classId: 'c' }))).toEqual(['Informe um preço válido.']);
        expect(schema.safeParse({ quantity: '10', averagePrice: '1.123456789', classId: 'c' }).success).toBe(false);
    });
});
