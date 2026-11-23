import { describe, expect, it } from 'vitest';
import { titleView } from '../../../../../test/fixtures/assets';
import type { FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import { toFgcBody } from './fgc-body';

const ISSUER: FixedIncomeFormInput['issuer'] = titleView().issuer;

const VALID: FixedIncomeFormInput = {
    kind: 'cdb',
    issuer: ISSUER,
    name: 'CDB Banco XP',
    indexer: 'cdi_percent',
    rate: '110',
    applied: 5000000,
    currency: 'BRL',
    appliedAt: '2025-03-10',
    maturityDate: '2028-03-10',
    classId: 'class-rf-pos'
};

describe('toFgcBody', () => {
    it('monta o corpo da simulação', () => {
        expect(toFgcBody(VALID, undefined)).toEqual({ issuerId: 'banco-xp', kind: 'cdb', valueMinor: 5000000 });
    });

    it('leva o título em edição para sair da soma', () => {
        expect(toFgcBody(VALID, 'title-9')).toEqual({ issuerId: 'banco-xp', kind: 'cdb', valueMinor: 5000000, excludeTitleId: 'title-9' });
    });

    it('não simula sem emissor, sem valor ou em dólar', () => {
        expect(toFgcBody({ ...VALID, issuer: null }, undefined)).toBeNull();
        expect(toFgcBody({ ...VALID, applied: null }, undefined)).toBeNull();
        expect(toFgcBody({ ...VALID, applied: 0 }, undefined)).toBeNull();
        expect(toFgcBody({ ...VALID, currency: 'USD' }, undefined)).toBeNull();
    });
});
