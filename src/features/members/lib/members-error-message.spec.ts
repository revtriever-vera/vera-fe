import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { membersErrorMessage } from './members-error-message';

function failure(type: string, status: number): ApiError {
    return new ApiError({ type, title: type, status, detail: 'detalhe técnico', requestId: null });
}

describe('membersErrorMessage', () => {
    const t: TFunction<'members'> = i18n.getFixedT('pt-BR', 'members');

    it.each([
        ['invites.already_member', 409, 'Essa pessoa já está na conta.'],
        ['members.limit_reached', 409, 'A conta já tem 10 pessoas.'],
        ['members.last_owner', 409, 'A conta precisa de pelo menos um Dono. Passe o papel a outra pessoa antes.'],
        ['members.forbidden_role', 403, 'Seu papel nesta conta mudou. Atualize a página.'],
        ['members.not_found', 404, 'Essa pessoa não está mais na conta. Atualize a página.'],
        ['invites.not_found', 404, 'Esse convite não existe mais. Atualize a página.'],
        ['core.too_many_attempts', 429, 'Muitas tentativas. Aguarde um pouco e tente de novo.']
    ])('maps %s', (type: string, status: number, message: string): void => {
        expect(membersErrorMessage(t, failure(type, status))).toBe(message);
    });

    it('treats any 429 as too many attempts', (): void => {
        expect(membersErrorMessage(t, failure('other', 429))).toBe('Muitas tentativas. Aguarde um pouco e tente de novo.');
    });

    it('falls back for unknown codes and for network errors, never showing the detail', (): void => {
        const generic: string = 'Não foi possível concluir. Tente novamente em instantes.';
        expect(membersErrorMessage(t, failure('x.y', 500))).toBe(generic);
        expect(membersErrorMessage(t, new Error('network'))).toBe(generic);
    });
});
