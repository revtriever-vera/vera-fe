import { describe, expect, it } from 'vitest';
import { columnsOf, humanizeKey, MAX_COLUMNS, recordRows, scalarText, type ScalarLabels } from './account-data-view';
import { toAccessInput } from './open-account-input';

const labels: ScalarLabels = { yes: 'Sim', no: 'Não', empty: 'Sem dados' };

describe('account data view', () => {
    it('humanizes keys', () => {
        expect(humanizeKey('signup_offer')).toBe('Signup offer');
        expect(humanizeKey('targetMinor')).toBe('Target minor');
    });

    it('writes scalars, empties and nested values as text', () => {
        expect(scalarText(null, labels)).toBe('Sem dados');
        expect(scalarText('', labels)).toBe('Sem dados');
        expect(scalarText(true, labels)).toBe('Sim');
        expect(scalarText(false, labels)).toBe('Não');
        expect(scalarText(12, labels)).toBe('12');
        expect(scalarText({ a: 1 }, labels)).toBe('{"a":1}');
    });

    it('takes only arrays of records as rows', () => {
        expect(recordRows([{ a: 1 }])).toEqual([{ a: 1 }]);
        expect(recordRows([])).toBeNull();
        expect(recordRows([1, 2])).toBeNull();
        expect(recordRows({ a: 1 })).toBeNull();
    });

    it('joins the keys of every row and caps the columns', () => {
        expect(columnsOf([{ a: 1 }, { b: 2 }])).toEqual(['a', 'b']);
        const wide: Record<string, number> = Object.fromEntries(
            Array.from({ length: 12 }, (_, index: number): [string, number] => [`k${String(index)}`, index])
        );
        expect(columnsOf([wide])).toHaveLength(MAX_COLUMNS);
    });

    it('builds the access input with trimmed reason and the chosen layers', () => {
        expect(toAccessInput({ reason: '  suporte  ', summary: false, data: true })).toEqual({ reason: 'suporte', layers: ['data'] });
    });
});
