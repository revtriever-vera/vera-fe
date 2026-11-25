import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { assistantErrorMessage, capResetsAt } from './assistant-error-message';

const t: TFunction<'assistant'> = i18n.getFixedT('pt-BR', 'assistant');

function problem(type: string, status: number, meta?: Record<string, unknown>): ApiError {
    return new ApiError({ type, title: type, status, detail: type, requestId: 'req-1', meta });
}

describe('assistantErrorMessage', () => {
    it('traduz o teto com a data da virada', () => {
        expect(assistantErrorMessage(t, problem('usage.cap_reached', 402), '1º de dezembro')).toBe(
            'Perguntas pausadas até 1º de dezembro.'
        );
    });

    it('traduz o teto sem data', () => {
        expect(assistantErrorMessage(t, problem('usage.cap_reached', 402), null)).toBe('Perguntas pausadas até o 1º dia do mês que vem.');
    });

    it.each([
        ['ai.provider_disabled', 503, 'As respostas não estão disponíveis agora.'],
        ['assistant.turn_not_found', 404, 'Essa conversa não existe mais. Comece uma nova.'],
        ['qualquer.coisa', 429, 'Você fez muitas perguntas seguidas. Tente de novo daqui a pouco.'],
        ['qualquer.coisa', 500, 'Não consegui enviar a pergunta. Tente de novo.']
    ])('%s (%i)', (type, status, message) => {
        expect(assistantErrorMessage(t, problem(type, status), null)).toBe(message);
    });

    it('cai no genérico quando não é ApiError', () => {
        expect(assistantErrorMessage(t, new Error('rede'), null)).toBe('Não consegui enviar a pergunta. Tente de novo.');
    });
});

describe('capResetsAt', () => {
    it('lê resetsAt do problema de teto', () => {
        expect(capResetsAt(problem('usage.cap_reached', 402, { resetsAt: '2026-12-01T03:00:00.000Z' }))).toBe('2026-12-01T03:00:00.000Z');
    });

    it('é nulo para outros erros e sem erro', () => {
        expect(capResetsAt(problem('x', 500))).toBeNull();
        expect(capResetsAt(null)).toBeNull();
    });
});
