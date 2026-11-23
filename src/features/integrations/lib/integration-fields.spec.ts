import { describe, expect, it } from 'vitest';
import { integrationItem } from '../../../../test/fixtures/integrations';
import { initialFormValues, lastCharacters } from './integration-fields';

describe('initialFormValues', () => {
    it('pré-preenche os campos públicos e nunca os segredos', () => {
        expect(initialFormValues('llm', integrationItem('llm', true))).toEqual({
            baseUrl: 'https://llm.example.test/v1',
            apiKey: '',
            model: 'modelo-exemplo'
        });
        expect(initialFormValues('whatsapp', integrationItem('whatsapp', true))).toEqual({
            accessToken: '',
            phoneNumberId: '109876543210',
            verifyToken: '',
            appSecret: ''
        });
    });

    it('começa tudo vazio sem chave', () => {
        expect(initialFormValues('google', undefined)).toEqual({ clientId: '', clientSecret: '' });
        expect(initialFormValues('google', integrationItem('google', false))).toEqual({ clientId: '', clientSecret: '' });
    });
});

describe('lastCharacters', () => {
    it('tira as reticências da dica', () => {
        expect(lastCharacters('…1a2b')).toBe('1a2b');
        expect(lastCharacters('1a2b')).toBe('1a2b');
        expect(lastCharacters(null)).toBeNull();
    });
});
