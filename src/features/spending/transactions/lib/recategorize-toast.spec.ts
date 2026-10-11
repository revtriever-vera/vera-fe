import { afterEach, describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { i18n } from '@/shared/lib/i18n';
import { recategorizeToast } from './recategorize-toast';

function translate(): TFunction<'spendingTransactions'> {
    return i18n.getFixedT(null, 'spendingTransactions');
}

afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
});

describe('recategorizeToast', () => {
    it('sem regra só diz que a categoria foi aplicada', () => {
        expect(recategorizeToast(translate(), { reverted: false, ruleLabel: null, recategorized: 0 })).toEqual({
            title: 'Categoria aplicada'
        });
    });

    it('com regra e nenhuma outra transação, nomeia só a regra', () => {
        expect(recategorizeToast(translate(), { reverted: false, ruleLabel: 'Maria Souza', recategorized: 0 }).detail).toBe(
            'Regra criada para Maria Souza.'
        );
    });

    it('com uma outra transação, usa o singular', () => {
        expect(recategorizeToast(translate(), { reverted: false, ruleLabel: 'Maria Souza', recategorized: 1 }).detail).toBe(
            'Regra criada para Maria Souza: mais 1 transação recategorizada.'
        );
    });

    it('com várias, usa o plural', () => {
        expect(recategorizeToast(translate(), { reverted: false, ruleLabel: 'Maria Souza', recategorized: 7 }).detail).toBe(
            'Regra criada para Maria Souza: mais 7 transações recategorizadas.'
        );
    });

    it('voltar ao automático tem texto próprio', () => {
        expect(recategorizeToast(translate(), { reverted: true, ruleLabel: null, recategorized: 0 }).title).toBe(
            'A categoria voltou ao automático'
        );
    });

    it('em inglês, singular e plural', async () => {
        await i18n.changeLanguage('en');

        expect(recategorizeToast(translate(), { reverted: false, ruleLabel: 'Maria Souza', recategorized: 1 }).detail).toBe(
            'Rule created for Maria Souza: 1 more transaction recategorized.'
        );
        expect(recategorizeToast(translate(), { reverted: false, ruleLabel: 'Maria Souza', recategorized: 3 }).detail).toBe(
            'Rule created for Maria Souza: 3 more transactions recategorized.'
        );
    });
});
