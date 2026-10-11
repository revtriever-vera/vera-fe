import { describe, expect, it } from 'vitest';
import type { z, ZodIssue } from 'zod';
import { i18n } from '@/shared/lib/i18n';
import { createFixedIncomeSchema, type FixedIncomeFormInput } from './fixed-income.schema';

const TODAY: string = '2026-10-09';
const schema: z.ZodType<FixedIncomeFormInput> = createFixedIncomeSchema(i18n.getFixedT('pt-BR', 'portfolioAssets'), TODAY);

const VALID: FixedIncomeFormInput = {
    kind: 'cdb',
    name: 'CDB Banco XP',
    indexer: 'cdi_percent',
    rate: '110',
    applied: 5000000,
    currency: 'BRL',
    appliedAt: '2025-03-10',
    maturityDate: '2028-03-10',
    classId: 'class-rf-pos'
};

function issues(input: FixedIncomeFormInput): { path: string; message: string }[] {
    const result: z.SafeParseReturnType<FixedIncomeFormInput, FixedIncomeFormInput> = schema.safeParse(input);
    return result.success ? [] : result.error.issues.map((issue: ZodIssue) => ({ path: issue.path.join('.'), message: issue.message }));
}

describe('createFixedIncomeSchema', () => {
    it('aceita um CDB completo', () => {
        expect(issues(VALID)).toEqual([]);
    });

    it('recusa vencimento antes ou no dia da aplicação', () => {
        expect(issues({ ...VALID, maturityDate: '2025-03-09' })).toEqual([
            { path: 'maturityDate', message: 'O vencimento precisa ser depois da aplicação.' }
        ]);
        expect(issues({ ...VALID, maturityDate: '2025-03-10' })).toHaveLength(1);
    });

    it('recusa data futura e anterior a 2010', () => {
        expect(issues({ ...VALID, appliedAt: '2026-10-10' })[0]?.path).toBe('appliedAt');
        expect(issues({ ...VALID, appliedAt: '2009-12-31' })[0]?.path).toBe('appliedAt');
        expect(issues({ ...VALID, appliedAt: TODAY, maturityDate: '2027-01-01' })).toEqual([]);
    });

    it('pede as datas quando faltam', () => {
        expect(issues({ ...VALID, appliedAt: null, maturityDate: null }).map((item) => item.path)).toEqual(['appliedAt', 'maturityDate']);
    });

    it('aceita dólar só com prefixado', () => {
        expect(issues({ ...VALID, currency: 'USD' })).toEqual([{ path: 'currency', message: 'Em dólar, só títulos prefixados.' }]);
        expect(issues({ ...VALID, currency: 'USD', indexer: 'prefixed', rate: '12,5' })).toEqual([]);
    });

    it('confere a taxa pelo intervalo do indexador', () => {
        expect(issues({ ...VALID, rate: '0' })[0]?.path).toBe('rate');
        expect(issues({ ...VALID, rate: '301' })[0]?.path).toBe('rate');
        expect(issues({ ...VALID, rate: '300' })).toEqual([]);
        expect(issues({ ...VALID, indexer: 'prefixed', rate: '101' })[0]?.path).toBe('rate');
        expect(issues({ ...VALID, indexer: 'ipca_plus', rate: '50,01' })[0]?.path).toBe('rate');
        expect(issues({ ...VALID, rate: 'abc' })[0]?.path).toBe('rate');
        expect(issues({ ...VALID, rate: '' }).map((item) => item.message)).toContain('Informe a taxa.');
    });

    it('exige valor aplicado positivo, nome e classe', () => {
        expect(issues({ ...VALID, applied: null })[0]?.path).toBe('applied');
        expect(issues({ ...VALID, applied: 0 })[0]?.path).toBe('applied');
        expect(issues({ ...VALID, name: '   ' })[0]?.message).toBe('Informe o nome do título.');
        expect(issues({ ...VALID, name: 'x'.repeat(81) })[0]?.message).toBe('Use até 80 caracteres.');
        expect(issues({ ...VALID, name: 'a\u0007b' })[0]?.path).toBe('name');
        expect(issues({ ...VALID, classId: '' })[0]?.message).toBe('Escolha a classe do título.');
    });
});
