import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { createRuleSchema, type RuleFormInput } from './rule.schema';

const VALID: RuleFormInput = { matchType: 'contains', pattern: 'padaria', appliesTo: 'out', categoryId: 'cat-1', applyToPast: true };

function messages(input: object): string[] {
    const result: ReturnType<ReturnType<typeof createRuleSchema>['safeParse']> = createRuleSchema(
        i18n.getFixedT('pt-BR', 'spendingRules')
    ).safeParse(input);
    return result.success ? [] : result.error.issues.map((issue): string => issue.message);
}

describe('createRuleSchema', () => {
    it('aceita uma regra completa', () => {
        expect(messages(VALID)).toEqual([]);
    });

    it('recusa o texto curto, depois de aparar', () => {
        expect(messages({ ...VALID, pattern: ' a ' })).toEqual(['Use pelo menos 2 caracteres']);
    });

    it('recusa o texto longo', () => {
        expect(messages({ ...VALID, pattern: 'x'.repeat(81) })).toEqual(['Use no máximo 80 caracteres']);
    });

    it('exige a categoria', () => {
        expect(messages({ ...VALID, categoryId: '' })).toEqual(['Escolha uma categoria']);
    });

    it('só aceita os sentidos e os tipos conhecidos', () => {
        expect(messages({ ...VALID, appliesTo: 'both' })).toHaveLength(1);
        expect(messages({ ...VALID, matchType: 'counterparty' })).toHaveLength(1);
        expect(messages({ ...VALID, appliesTo: 'any' })).toEqual([]);
    });
});
