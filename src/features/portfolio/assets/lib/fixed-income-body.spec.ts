import { describe, expect, it } from 'vitest';
import type { FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import { toPreviewBody, toTitleBody } from './fixed-income-body';

const VALID: FixedIncomeFormInput = {
    kind: 'cdb',
    name: '  CDB Banco XP  ',
    indexer: 'cdi_percent',
    rate: '110',
    applied: 5000000,
    currency: 'BRL',
    appliedAt: '2025-03-10',
    maturityDate: '2028-03-10',
    classId: 'class-rf-pos'
};

describe('fixed-income-body', () => {
    it('monta a prévia com taxa em pontos-base e valor inteiro', () => {
        expect(toPreviewBody(VALID)).toEqual({
            kind: 'cdb',
            indexer: 'cdi_percent',
            rateBps: 11000,
            currency: 'BRL',
            appliedMinor: 5000000,
            appliedAt: '2025-03-10',
            maturityDate: '2028-03-10'
        });
    });

    it('monta o título com nome aparado e classe', () => {
        expect(toTitleBody(VALID)).toMatchObject({ name: 'CDB Banco XP', classId: 'class-rf-pos', rateBps: 11000 });
    });

    it('devolve nulo quando falta dado', () => {
        expect(toPreviewBody({ ...VALID, applied: null })).toBeNull();
        expect(toPreviewBody({ ...VALID, appliedAt: null })).toBeNull();
        expect(toPreviewBody({ ...VALID, maturityDate: null })).toBeNull();
        expect(toPreviewBody({ ...VALID, rate: 'x' })).toBeNull();
        expect(toTitleBody({ ...VALID, rate: 'x' })).toBeNull();
    });
});
