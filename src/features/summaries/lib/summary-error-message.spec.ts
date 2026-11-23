import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { summaryErrorMessage } from './summary-error-message';

const t: TFunction<'summaries'> = i18n.getFixedT('pt-BR', 'summaries');

function problem(type: string, status: number): ApiError {
    return new ApiError({ type, title: 'Error', status, detail: 'technical', requestId: null });
}

describe('summaryErrorMessage', () => {
    it.each([
        ['ai.consent_required', 403, 'Permita o envio dos totais para ver este resumo.'],
        ['billing.premium_required', 402, 'Os resumos fazem parte do Premium.'],
        ['billing.feature_disabled', 503, 'Este servidor ainda não tem o modelo de linguagem cadastrado.'],
        ['ai.provider_unavailable', 503, 'Não deu para escrever o resumo agora. Os números da tela continuam certos.'],
        ['ai.invalid_response', 502, 'Não deu para escrever o resumo agora. Os números da tela continuam certos.'],
        ['ai.notice_outdated', 409, 'O aviso mudou. Leia o pedido de novo e permita outra vez.'],
        [
            'ai.repeated_request',
            429,
            'Este resumo já foi escrito várias vezes hoje com os mesmos números. Ele muda quando os números mudarem.'
        ],
        ['core.too_many_attempts', 429, 'Você pediu muitos resumos nesta hora. Tente de novo mais tarde.']
    ])('traduz %s', (type: string, status: number, expected: string) => {
        expect(summaryErrorMessage(t, problem(type, status), null)).toBe(expected);
    });

    it('a cota esgotada fala a data da virada', () => {
        expect(summaryErrorMessage(t, problem('usage.cap_reached', 402), '1º de dezembro')).toBe(
            'Resumos pausados até 1º de dezembro. A cota do mês acabou; o resto da Vera segue normal.'
        );
    });

    it('a cota esgotada sem data fala da virada do mês', () => {
        expect(summaryErrorMessage(t, problem('usage.cap_reached', 402), null)).toContain('até a virada do mês');
    });

    it('um 429 de código desconhecido vira o aviso de muitos pedidos', () => {
        expect(summaryErrorMessage(t, problem('rate_limit.exceeded', 429), null)).toBe(
            'Você pediu muitos resumos nesta hora. Tente de novo mais tarde.'
        );
    });

    it('um código desconhecido e um erro de rede caem no genérico, sem mostrar o detail', () => {
        const generic: string = 'Não deu para mostrar o resumo agora. Tente de novo em instantes.';
        expect(summaryErrorMessage(t, problem('x.unknown', 500), null)).toBe(generic);
        expect(summaryErrorMessage(t, new TypeError('Failed to fetch'), null)).toBe(generic);
    });
});
