import { describe, expect, it } from 'vitest';
import {
    columnsOf,
    enumValueText,
    fieldLabel,
    fieldText,
    humanizeKey,
    MAX_COLUMNS,
    recordRows,
    scalarText,
    type ScalarLabels
} from './account-data-view';
import { toAccessInput } from './open-account-input';

const labels: ScalarLabels = { yes: 'Sim', no: 'Não', empty: 'Sem dados', values: { card: 'Cartão', card_trial: 'Teste com cartão' } };

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

function plain(text: string): string {
    return text.replaceAll('\u00a0', ' ');
}

describe('field text', () => {
    it('writes money, micros, basis points and dates by the key', () => {
        expect(plain(fieldText('targetMinor', 1000000, labels, 'pt-BR'))).toBe('R$ 10.000,00');
        expect(plain(fieldText('totalCents', 1990, labels, 'pt-BR'))).toBe('R$ 19,90');
        expect(plain(fieldText('costMicros', 1500000, labels, 'pt-BR'))).toBe('R$ 1,50');
        expect(fieldText('targetBps', 2500, labels, 'pt-BR')).toBe('25%');
        expect(fieldText('targetDate', '2027-12-31', labels, 'pt-BR')).toBe('31/12/2027');
        expect(fieldText('paidAt', '2026-11-10T12:00:00.000Z', labels, 'pt-BR')).toContain('10/11/2026');
    });

    it('translates the keys and the known enum values, leaving the rest as it came', () => {
        expect(fieldLabel('toleranceBps', { toleranceBps: 'Tolerância' })).toBe('Tolerância');
        expect(fieldLabel('someNewKey', {})).toBe('Some new key');
        expect(fieldText('paymentMethod', 'card', labels, 'pt-BR')).toBe('Cartão');
        expect(fieldText('planSource', 'card_trial', labels, 'pt-BR')).toBe('Teste com cartão');
        expect(fieldText('kind', 'unknown_kind', labels, 'pt-BR')).toBe('unknown_kind');
        expect(fieldText('name', 'card', labels, 'pt-BR')).toBe('card');
        expect(enumValueText('pix', {})).toBe('pix');
    });

    it('takes the currency from the row and leaves other values as text', () => {
        expect(plain(fieldText('amountMinor', 1000, labels, 'en', 'USD'))).toBe('$10.00');
        expect(fieldText('entries', 12, labels, 'pt-BR')).toBe('12');
        expect(fieldText('name', null, labels, 'pt-BR')).toBe('Sem dados');
    });
});
