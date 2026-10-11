import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { recategorizedToast } from './recategorized-toast';

describe('recategorizedToast', () => {
    it('concorda o plural em pt-BR', () => {
        const t: TFunction<'spendingRules'> = i18n.getFixedT('pt-BR', 'spendingRules');

        expect(recategorizedToast(t, 'ruleUpdated', 1)).toBe('Regra atualizada: 1 transação recategorizada');
        expect(recategorizedToast(t, 'ruleUpdated', 12)).toBe('Regra atualizada: 12 transações recategorizadas');
        expect(recategorizedToast(t, 'ruleDeleted', 0)).toBe('Regra excluída: nenhuma transação mudou');
        expect(recategorizedToast(t, 'categoryDeleted', 2)).toBe('Categoria excluída: 2 transações recategorizadas');
        expect(recategorizedToast(t, 'ruleCreated', 1)).toBe('Regra criada: 1 transação recategorizada');
    });

    it('concorda o plural em inglês', () => {
        const t: TFunction<'spendingRules'> = i18n.getFixedT('en', 'spendingRules');

        expect(recategorizedToast(t, 'ruleCreated', 1)).toBe('Rule created: 1 transaction recategorized');
        expect(recategorizedToast(t, 'ruleCreated', 3)).toBe('Rule created: 3 transactions recategorized');
        expect(recategorizedToast(t, 'categoryDeleted', 0)).toBe('Category deleted: no transaction changed');
    });
});
