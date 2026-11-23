import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { calendarCodeMessage, calendarErrorMessage } from './calendar-error-message';

const t: TFunction<'calendar'> = i18n.getFixedT('pt-BR', 'calendar');

describe('calendarCodeMessage', () => {
    it.each([
        ['calendar.consent_denied', 'Você não autorizou a agenda. Nada foi conectado.'],
        ['calendar.scope_missing', 'A permissão de ver e editar eventos não foi marcada. Conecte de novo e marque a opção.'],
        ['calendar.state_invalid', 'O pedido venceu. Conecte de novo.'],
        ['calendar.provider_unavailable', 'O Google não respondeu a tempo. Tente de novo em instantes.'],
        ['calendar.provider_disabled', 'O Google Agenda está indisponível agora.'],
        ['outra.coisa', 'Não deu certo agora. Tente de novo em instantes.']
    ])('%s', (code, message) => {
        expect(calendarCodeMessage(t, code)).toBe(message);
    });
});

describe('calendarErrorMessage', () => {
    it('usa o tipo do problema', () => {
        const error: ApiError = new ApiError({ type: 'calendar.provider_disabled', title: 'x', status: 503, detail: 'x', requestId: null });
        expect(calendarErrorMessage(t, error)).toBe('O Google Agenda está indisponível agora.');
    });

    it('erro de rede cai na mensagem genérica', () => {
        expect(calendarErrorMessage(t, new Error('network'))).toBe('Não deu certo agora. Tente de novo em instantes.');
    });
});
