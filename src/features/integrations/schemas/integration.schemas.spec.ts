import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { createIntegrationSchema } from './integration.schemas';

const t: TFunction<'integrations'> = i18n.getFixedT('pt-BR', 'integrations');

describe('createIntegrationSchema', () => {
    const llm: ReturnType<typeof createIntegrationSchema> = createIntegrationSchema(t, 'llm');
    const valid: Record<string, string> = { baseUrl: 'http://localhost:11434/v1', apiKey: 'chave-de-teste', model: 'llama3.1:8b' };

    it('aceita um modelo local por http', () => {
        expect(llm.safeParse(valid).success).toBe(true);
    });

    it.each([
        ['baseUrl', 'ftp://x.test', 'Use um endereço que comece com https:// (ou http:// em rede local).'],
        ['baseUrl', '', 'Preencha este campo.'],
        ['apiKey', 'curta', 'Use de 8 a 512 caracteres, sem espaços.'],
        ['apiKey', 'com espaco no meio', 'Use de 8 a 512 caracteres, sem espaços.'],
        ['model', '-invalido', 'Esse nome de modelo não é válido.']
    ])('recusa %s = %j', (field: string, value: string, message: string) => {
        const result: ReturnType<typeof llm.safeParse> = llm.safeParse({ ...valid, [field]: value });
        expect(result.success ? [] : result.error.issues.map((issue) => issue.message)).toContain(message);
    });

    it('confere o ID do número e o Client ID', () => {
        const whatsapp: ReturnType<typeof createIntegrationSchema> = createIntegrationSchema(t, 'whatsapp');
        const google: ReturnType<typeof createIntegrationSchema> = createIntegrationSchema(t, 'google');
        const base: Record<string, string> = {
            accessToken: 'token-de-teste',
            verifyToken: 'verifica-teste',
            appSecret: 'app-secret-teste'
        };

        expect(whatsapp.safeParse({ ...base, phoneNumberId: '12a45' }).success).toBe(false);
        expect(whatsapp.safeParse({ ...base, phoneNumberId: '109876543210' }).success).toBe(true);
        expect(google.safeParse({ clientId: 'abc', clientSecret: 'segredo-de-teste' }).success).toBe(false);
        expect(google.safeParse({ clientId: 'abc.apps.googleusercontent.com', clientSecret: 'segredo-de-teste' }).success).toBe(true);
    });
});
