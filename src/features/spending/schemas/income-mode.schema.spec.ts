import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import type { z } from 'zod';
import { createIncomeModeSchema, type IncomeModeFormInput } from './income-mode.schema';

const schema: z.ZodType<IncomeModeFormInput> = createIncomeModeSchema(i18n.getFixedT('pt-BR', 'spending'));

describe('createIncomeModeSchema', () => {
    it('aceita as transações sem valor', () => {
        expect(schema.safeParse({ mode: 'transactions', declaredIncomeMinor: null }).success).toBe(true);
    });

    it('aceita valor fixo maior que zero', () => {
        expect(schema.safeParse({ mode: 'declared', declaredIncomeMinor: 500000 }).success).toBe(true);
    });

    it.each([null, 0, -100])('recusa valor fixo com %s no campo do valor', (declaredIncomeMinor: number | null) => {
        const result: z.SafeParseReturnType<IncomeModeFormInput, IncomeModeFormInput> = schema.safeParse({
            mode: 'declared',
            declaredIncomeMinor
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.path).toEqual(['declaredIncomeMinor']);
        expect(result.error?.issues[0]?.message).toBe('Informe um valor maior que zero');
    });

    it('recusa um modo desconhecido', () => {
        expect(schema.safeParse({ mode: 'outro', declaredIncomeMinor: null }).success).toBe(false);
    });
});
