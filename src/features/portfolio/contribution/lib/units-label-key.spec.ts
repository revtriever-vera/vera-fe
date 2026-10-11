import { describe, expect, it } from 'vitest';
import { unitsLabelKey } from './units-label-key';

describe('unitsLabelKey', () => {
    it.each([
        ['acoes_br', '40', 'shares'],
        ['fii', '2', 'shares'],
        ['acoes_eua', '0.612345', 'shares'],
        ['reits', '3', 'shares'],
        ['cripto', '0.0123', 'units'],
        ['tesouro', '2.5', 'bonds'],
        ['acoes_br', '0', 'less_than_one'],
        ['cripto', '0.000000', 'less_than_one'],
        ['fixed_income', null, 'fixed_income'],
        ['acoes_br', null, 'price_unavailable'],
        ['tesouro', null, 'price_unavailable']
    ])('%s com %s vira %s', (typeGroup: string, approxUnits: string | null, expected: string) => {
        expect(unitsLabelKey(typeGroup, approxUnits)).toBe(expected);
    });
});
