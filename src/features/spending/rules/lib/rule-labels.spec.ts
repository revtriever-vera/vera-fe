import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { pickerDirection, ruleAppliesToLabel, ruleDomId, ruleLabel, ruleMatchesSearch, ruleTypeLabel } from './rule-labels';

describe('rótulos das regras', () => {
    it('em pt-BR, rotula o tipo, o sentido e o texto de cada regra', () => {
        const t: TFunction<'spendingRules'> = i18n.getFixedT('pt-BR', 'spendingRules');

        expect(ruleLabel(t, { matchType: 'counterparty', label: 'Maria Souza' })).toBe('Maria Souza');
        expect(ruleLabel(t, { matchType: 'contains', label: 'padaria estrela' })).toBe('contém padaria estrela');
        expect(ruleLabel(t, { matchType: 'description', label: 'pix padaria' })).toBe('igual a pix padaria');
        expect(ruleTypeLabel(t, 'counterparty')).toBe('destinatário');
        expect(ruleTypeLabel(t, 'description')).toBe('descrição igual');
        expect(ruleTypeLabel(t, 'contains')).toBe('contém');
        expect(ruleAppliesToLabel(t, 'out')).toBe('saídas');
        expect(ruleAppliesToLabel(t, 'in')).toBe('entradas');
        expect(ruleAppliesToLabel(t, 'any')).toBe('ambas');
    });

    it('em inglês, rotula o tipo, o sentido e o texto de cada regra', () => {
        const t: TFunction<'spendingRules'> = i18n.getFixedT('en', 'spendingRules');

        expect(ruleLabel(t, { matchType: 'contains', label: 'bakery' })).toBe('contains bakery');
        expect(ruleLabel(t, { matchType: 'description', label: 'bakery' })).toBe('equal to bakery');
        expect(ruleTypeLabel(t, 'counterparty')).toBe('payee');
        expect(ruleAppliesToLabel(t, 'any')).toBe('both');
    });

    it('gera o id do elemento, a direção do seletor e a busca sem acento', () => {
        expect(ruleDomId('abc')).toBe('rule-abc');
        expect(pickerDirection('any')).toBeUndefined();
        expect(pickerDirection('in')).toBe('in');
        expect(ruleMatchesSearch('Padaria Estrela', 'estréla')).toBe(true);
        expect(ruleMatchesSearch('Padaria', 'mercado')).toBe(false);
    });
});
