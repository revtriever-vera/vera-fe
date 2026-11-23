import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { integrationErrorMessage, testFailureReason } from './integration-error-message';

const t: TFunction<'integrations'> = i18n.getFixedT('pt-BR', 'integrations');

function apiError(type: string, status: number, meta?: Record<string, unknown>): ApiError {
    return new ApiError({ type, title: type, status, detail: 'x', requestId: null, ...(meta === undefined ? {} : { meta }) });
}

describe('integrationErrorMessage', () => {
    it.each([
        ['llm', 'unauthorized', 'A chave foi recusada.'],
        ['llm', 'invalid_model', 'Modelo não encontrado nesse provedor.'],
        ['llm', 'unreachable', 'Não foi possível chegar à URL da API.'],
        ['llm', 'not_found', 'Não encontramos esse recurso no provedor. Confira a URL da API.'],
        ['whatsapp', 'not_found', 'O ID do número não foi encontrado na Meta.'],
        ['whatsapp', 'unreachable', 'Não foi possível chegar à API da Meta.'],
        ['llm', 'outra_coisa', 'Não foi possível concluir agora. Tente novamente em instantes.']
    ] as const)('%s com motivo %s', (kind, reason, message): void => {
        expect(integrationErrorMessage(t, apiError('integrations.test_failed', 422, { reason }), kind)).toBe(message);
    });

    it.each([
        ['integrations.phone_in_use', 409, 'Esse número já está ligado a outra conta.'],
        ['integrations.not_available', 404, 'As chaves só se cadastram em uma instalação auto-hospedada.'],
        ['identity.forbidden', 403, 'Só o Dono da conta mexe nas chaves.'],
        ['validation_failed', 400, 'Confira os campos e tente de novo.'],
        ['core.too_many_attempts', 429, 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'],
        ['x.desconhecido', 500, 'Não foi possível concluir agora. Tente novamente em instantes.']
    ])('%s', (type: string, status: number, message: string): void => {
        expect(integrationErrorMessage(t, apiError(type, status), 'llm')).toBe(message);
    });

    it('cai no texto genérico para um erro que não vem da API', () => {
        expect(integrationErrorMessage(t, new Error('rede'), 'llm')).toBe('Não foi possível concluir agora. Tente novamente em instantes.');
    });

    it('lê o motivo só do erro de teste', () => {
        expect(testFailureReason(apiError('integrations.test_failed', 422, { reason: 'unauthorized' }))).toBe('unauthorized');
        expect(testFailureReason(apiError('integrations.test_failed', 422))).toBe('unknown');
        expect(testFailureReason(apiError('validation_failed', 400))).toBeNull();
        expect(testFailureReason(new Error('rede'))).toBeNull();
    });
});
