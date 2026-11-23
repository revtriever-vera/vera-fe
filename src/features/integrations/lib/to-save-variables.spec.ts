import { describe, expect, it } from 'vitest';
import { toSaveVariables } from './to-save-variables';

describe('toSaveVariables', () => {
    it('monta o corpo de cada tipo e apara os espaços', () => {
        expect(toSaveVariables('llm', { baseUrl: ' https://a.test/v1 ', apiKey: ' chave-de-teste ', model: 'm' })).toEqual({
            kind: 'llm',
            body: { baseUrl: 'https://a.test/v1', apiKey: 'chave-de-teste', model: 'm' }
        });
        expect(toSaveVariables('whatsapp', { accessToken: 'a', phoneNumberId: '12345', verifyToken: 'v', appSecret: 's' })).toEqual({
            kind: 'whatsapp',
            body: { accessToken: 'a', phoneNumberId: '12345', verifyToken: 'v', appSecret: 's' }
        });
        expect(toSaveVariables('google', { clientId: 'x.apps.googleusercontent.com', clientSecret: 's' })).toEqual({
            kind: 'google',
            body: { clientId: 'x.apps.googleusercontent.com', clientSecret: 's' }
        });
    });
});
