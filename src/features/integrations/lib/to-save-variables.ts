import type { IntegrationFormValues, IntegrationKind, SaveIntegrationVariables } from '../types';

export function toSaveVariables(kind: IntegrationKind, values: IntegrationFormValues): SaveIntegrationVariables {
    const value = (name: string): string => (values[name] ?? '').trim();
    switch (kind) {
        case 'llm':
            return { kind, body: { baseUrl: value('baseUrl'), apiKey: value('apiKey'), model: value('model') } };
        case 'whatsapp':
            return {
                kind,
                body: {
                    accessToken: value('accessToken'),
                    phoneNumberId: value('phoneNumberId'),
                    verifyToken: value('verifyToken'),
                    appSecret: value('appSecret')
                }
            };
        case 'google':
            return { kind, body: { clientId: value('clientId'), clientSecret: value('clientSecret') } };
    }
}
