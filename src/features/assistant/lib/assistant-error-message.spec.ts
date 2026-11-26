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
        ['assistant.confirmation_stale', 409, 'O que eu ia fazer mudou desde que propus. Nada foi alterado.'],
        ['assistant.action_expired', 409, 'O prazo para confirmar acabou. Nada foi alterado.'],
        ['assistant.action_resolved', 409, 'Esta ação já foi resolvida.'],
        ['assistant.action_not_found', 404, 'Não encontrei esta ação.'],
        ['assistant.action_choice_invalid', 400, 'Escolha uma transação antes de confirmar.'],
        ['members.forbidden_role', 403, 'Só Dono ou Editor confirmam.'],
        ['file.too_large', 413, 'O arquivo passa de 10 MB. Mande um arquivo menor.'],
        [
            'format.not_recognized',
            422,
            'Não reconheci esse arquivo. Mande o relatório da B3 em Excel, uma nota de corretagem, um extrato ou um print.'
        ],
        ['format.too_many_rows', 422, 'O arquivo tem linhas demais. Mande um período menor.'],
        ['file.unreadable', 422, 'Não consegui ler esse arquivo. Tente uma imagem mais nítida ou o arquivo em PDF.'],
        ['model.unreadable', 422, 'Não consegui ler esse arquivo. Tente uma imagem mais nítida ou o arquivo em PDF.'],
        [
            'model.unavailable',
            503,
            'A leitura de notas, extratos e prints está fora do ar agora. O relatório da B3 em Excel continua funcionando.'
        ],
        ['import.nothing_to_import', 422, 'Não encontrei operações nesse arquivo para importar.'],
        ['assistant.text_required', 400, 'Escreva sua pergunta ou solte um arquivo.'],
        ['preview.expired', 410, 'A conferência expirou. Solte o arquivo de novo.'],
        ['import.has_blocked_lines', 422, 'Ainda há linhas para corrigir ou deixar de fora.'],
        ['import.invalid_corrections', 422, 'Uma das correções não bate com o arquivo. Solte o arquivo de novo.'],
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
