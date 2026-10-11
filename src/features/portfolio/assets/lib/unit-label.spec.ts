import { describe, expect, it } from 'vitest';
import { unitLabelKey } from './unit-label';

describe('unitLabelKey', () => {
    it.each(['acoes_br', 'fii', 'acoes_eua', 'reits'] as const)('%s usa cotas', (group) => {
        expect(unitLabelKey(group)).toBe('shares');
    });

    it('cripto usa unidades', () => {
        expect(unitLabelKey('cripto')).toBe('units');
    });

    it('Tesouro usa títulos', () => {
        expect(unitLabelKey('tesouro')).toBe('bonds');
    });

    it('renda fixa não tem unidade', () => {
        expect(unitLabelKey('fixed_income')).toBeNull();
    });
});
