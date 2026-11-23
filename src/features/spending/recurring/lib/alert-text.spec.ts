import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import type { RecurringAlert } from '../types';
import { recurringAlert } from '../../../../../test/fixtures/recurring';
import { alertText } from './alert-text';

const t: TFunction<'spendingRecurring'> = i18n.getFixedT('pt-BR', 'spendingRecurring');
const NBSP: string = String.fromCharCode(160);

function textOf(alert: RecurringAlert): string {
    return alertText(alert, 'pt-BR', t).replaceAll(NBSP, ' ');
}

describe('alertText', () => {
    it('começa pelo número no aumento de preço', () => {
        expect(textOf(recurringAlert())).toBe('Enel subiu de R$ 44,90 para R$ 55,90 em outubro (+25%)');
    });

    it('conta as duas cobranças no mesmo ciclo', () => {
        const alert: RecurringAlert = recurringAlert({
            kind: 'duplicate_charge',
            seriesName: 'Spotify',
            data: { firstDate: '2026-10-03', firstAmountMinor: 2190, secondDate: '2026-10-05', secondAmountMinor: 2190 }
        });

        expect(textOf(alert)).toBe('Spotify cobrou 2 vezes em outubro: R$ 21,90 em 03/10 e R$ 21,90 em 05/10');
    });

    it('nomeia as duas contas da mesma assinatura', () => {
        const alert: RecurringAlert = recurringAlert({
            kind: 'duplicate_account',
            seriesName: 'Netflix',
            data: { accountName: 'Nubank', otherAccountName: 'Itaú' }
        });

        expect(textOf(alert)).toBe('Netflix parece a mesma assinatura em duas contas: Nubank e Itaú');
    });

    it('descreve o teste que virou cobrança e a série que voltou', () => {
        const trial: RecurringAlert = recurringAlert({
            kind: 'trial_converted',
            data: { firstAmountMinor: 3990, chargeDate: '2026-11-04' }
        });
        const back: RecurringAlert = recurringAlert({
            kind: 'returned',
            data: { amountMinor: 3990, returnDate: '2026-11-04', gapDays: 75 }
        });

        expect(textOf(trial)).toBe('O teste de Enel virou cobrança: R$ 39,90 em 04/11');
        expect(textOf(back)).toBe('Enel voltou a cobrar R$ 39,90 em 04/11, 75 dias depois da última cobrança');
    });

    it('descreve a sugestão sem revisão e a renovação', () => {
        const using: RecurringAlert = recurringAlert({ kind: 'still_using', data: { amountMinor: 1990, chargeCount: 4 } });
        const renewal: RecurringAlert = recurringAlert({ kind: 'renewal', data: { amountMinor: 23900, daysUntil: 1 } });

        expect(textOf(using)).toBe('Enel cobrou 4 vezes (R$ 19,90) e ficou sem revisão. Você ainda usa?');
        expect(textOf(renewal)).toBe('Enel renova em 1 dia: R$ 239,00');
    });
});
