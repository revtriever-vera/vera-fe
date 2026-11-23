import { describe, expect, it } from 'vitest';
import { holding } from '../../../../../test/fixtures/portfolio';
import { hasUnreliableValue, holdingFlags, needsIssuer } from './holding-flags';

describe('holdingFlags', () => {
    it('devolve vazio sem sinalização', () => {
        expect(holdingFlags(holding())).toEqual([]);
    });

    it.each([
        ['missingQuote', 'missing_quote'],
        ['stale', 'stale'],
        ['estimated', 'estimated'],
        ['matured', 'matured'],
        ['missingRate', 'missing_rate']
    ] as const)('sinaliza %s isolada', (field, flag) => {
        expect(holdingFlags(holding({ [field]: true }))).toEqual([flag]);
    });

    it('combina na ordem fixa', () => {
        expect(holdingFlags(holding({ matured: true, missingQuote: true, estimated: true }))).toEqual([
            'missing_quote',
            'estimated',
            'matured'
        ]);
    });

    it('posição sem cotação ou sem câmbio nunca tem valor confiável', () => {
        expect(hasUnreliableValue(holding({ missingQuote: true, valueMinor: 0 }))).toBe(true);
        expect(hasUnreliableValue(holding({ missingRate: true }))).toBe(true);
        expect(hasUnreliableValue(holding({ stale: true }))).toBe(false);
    });
});

describe('needsIssuer', () => {
    it('pede o emissor só de título de renda fixa sem emissor', () => {
        expect(needsIssuer(holding({ kind: 'fixed_income', issuerId: null }))).toBe(true);
        expect(needsIssuer(holding({ kind: 'fixed_income', issuerId: 'banco-inter' }))).toBe(false);
        expect(needsIssuer(holding({ kind: 'position', issuerId: null }))).toBe(false);
    });
});
