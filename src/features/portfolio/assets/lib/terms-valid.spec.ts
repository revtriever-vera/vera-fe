import type { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { createFixedIncomeSchema, type FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import { termsAreValid } from './terms-valid';

const VALID: FixedIncomeFormInput = {
    kind: 'cdb',
    name: '',
    indexer: 'cdi_percent',
    rate: '105',
    applied: 100000,
    currency: 'BRL',
    appliedAt: '2025-03-10',
    maturityDate: '2028-03-10',
    classId: ''
};

describe('termsAreValid', () => {
    const schema: z.ZodType<FixedIncomeFormInput> = createFixedIncomeSchema(i18n.getFixedT('pt-BR', 'portfolioAssets'), '2026-10-09');

    it('aceita termos válidos mesmo sem nome e sem classe', () => {
        expect(termsAreValid(schema, VALID)).toBe(true);
    });

    it('recusa quando algum termo é inválido', () => {
        expect(termsAreValid(schema, { ...VALID, applied: null })).toBe(false);
        expect(termsAreValid(schema, { ...VALID, maturityDate: '2024-01-01' })).toBe(false);
    });
});
