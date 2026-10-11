import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import type { z } from 'zod';
import { i18n } from '@/shared/lib/i18n';
import { createCredentialsSchema, type CredentialsFormInput, type CredentialsFormMode } from './credentials.schema';

const ptBR: TFunction<'spendingConnections'> = i18n.getFixedT('pt-BR', 'spendingConnections');
const en: TFunction<'spendingConnections'> = i18n.getFixedT('en', 'spendingConnections');
const ITEM: string = '8b2c1d3e-1111-4222-8333-444455556666';
const VALID: CredentialsFormInput = { clientId: '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b', clientSecret: 'segredo-qualquer', itemIds: ITEM };

function messages(
    mode: CredentialsFormMode,
    input: CredentialsFormInput,
    t: TFunction<'spendingConnections'> = ptBR
): Record<string, string> {
    const result: z.SafeParseReturnType<CredentialsFormInput, CredentialsFormInput> = createCredentialsSchema(t, mode).safeParse(input);
    if (result.success) {
        return {};
    }
    return Object.fromEntries(result.error.issues.map((issue): [string, string] => [String(issue.path[0]), issue.message]));
}

describe('createCredentialsSchema', () => {
    it('aceita o formulário completo', () => {
        expect(messages('full', VALID)).toEqual({});
    });

    it('recusa Client ID que não é uuid, com a mensagem traduzida', () => {
        expect(messages('full', { ...VALID, clientId: 'abc' })['clientId']).toBe('O Client ID é um código no formato 3f9a1c2e-…');
        expect(messages('full', { ...VALID, clientId: 'abc' }, en)['clientId']).toBe('The Client ID is a code like 3f9a1c2e-…');
    });

    it('aceita o Client ID em maiúsculas e com espaços nas pontas', () => {
        expect(messages('full', { ...VALID, clientId: ` ${VALID.clientId.toUpperCase()} ` })).toEqual({});
    });

    it('recusa Client Secret vazio', () => {
        expect(messages('full', { ...VALID, clientSecret: '' })['clientSecret']).toBe('Informe o Client Secret.');
    });

    it('pede ao menos um Item ID e recusa texto que não é Item ID', () => {
        expect(messages('full', { ...VALID, itemIds: '  ' })['itemIds']).toBe('Cole ao menos um Item ID.');
        expect(messages('full', { ...VALID, itemIds: `${ITEM} segredo` })['itemIds']).toContain('não cole o Client Secret');
    });

    it('recusa mais de 10 Item IDs', () => {
        const many: string = Array.from(
            { length: 11 },
            (_unused: unknown, index: number): string => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`
        ).join(' ');

        expect(messages('full', { ...VALID, itemIds: many })['itemIds']).toBe('Cole no máximo 10 Item IDs por vez.');
    });

    it('na troca de credencial ignora os Item IDs', () => {
        expect(messages('rotate', { ...VALID, itemIds: '' })).toEqual({});
        expect(messages('rotate', { ...VALID, clientSecret: '' })['clientSecret']).toBeDefined();
    });

    it('ao adicionar bancos ignora as credenciais', () => {
        expect(messages('items', { clientId: '', clientSecret: '', itemIds: ITEM })).toEqual({});
        expect(messages('items', { clientId: '', clientSecret: '', itemIds: '' })['itemIds']).toBeDefined();
    });
});
