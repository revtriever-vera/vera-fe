import { describe, expect, it } from 'vitest';
import { importedTitle } from '../../../../../test/fixtures/investment-imports';
import { readImportedTitles, type ImportedTitle } from '../schemas/imported-title.schema';
import type { CreateTitleBody } from '../../assets/types';
import { importedCount, needsDecision, pendingTitles, toDecisions, type TitleChoices } from './title-choices';

const TITLES: ImportedTitle[] = readImportedTitles([
    importedTitle({ lineId: 'a' }),
    importedTitle({ lineId: 'b', status: 'needs_input', rateBps: null }),
    importedTitle({ lineId: 'c', status: 'duplicate' }),
    { lixo: true }
]);

describe('títulos de renda fixa da prévia', () => {
    it('descarta o que não tem o formato do contrato', () => {
        expect(TITLES.map((title: ImportedTitle): string => title.lineId)).toEqual(['a', 'b', 'c']);
    });

    it('duplicado não pede decisão', () => {
        expect(TITLES.map(needsDecision)).toEqual([true, true, false]);
        expect(pendingTitles(TITLES, {}).map((title: ImportedTitle): string => title.lineId)).toEqual(['a', 'b']);
    });

    it('converte as escolhas e conta os títulos que entram', () => {
        const edits: CreateTitleBody = {
            kind: 'cdb',
            indexer: 'cdi_percent',
            rateBps: 11000,
            currency: 'BRL',
            appliedMinor: 1,
            appliedAt: '2025-01-01',
            maturityDate: '2027-01-01',
            name: 'CDB',
            classId: 'c'
        };
        const choices: TitleChoices = { a: { type: 'confirm' }, b: { type: 'skip' } };

        expect(toDecisions(TITLES, choices)).toEqual([
            { lineId: 'a', confirm: true },
            { lineId: 'b', skip: true }
        ]);
        expect(toDecisions(TITLES, { a: { type: 'edit', edits } })).toEqual([{ lineId: 'a', edits }]);
        expect(importedCount(TITLES, choices)).toBe(1);
        expect(pendingTitles(TITLES, choices)).toEqual([]);
    });
});
