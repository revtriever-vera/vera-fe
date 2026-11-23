import type { IntegrationItem, IntegrationKind, IntegrationsView } from '@/features/integrations/types';

export const WEBHOOK_URL: string = 'https://vera.example.test/api/whatsapp/webhook';
export const REDIRECT_URL: string = 'https://vera.example.test/api/google/callback';

const PUBLIC_FIELDS: Readonly<Record<IntegrationKind, IntegrationItem['public']>> = {
    llm: { baseUrl: 'https://llm.example.test/v1', model: 'modelo-exemplo' },
    whatsapp: { phoneNumberId: '109876543210' },
    google: { clientId: '1234-exemplo.apps.googleusercontent.com' }
};

export function integrationItem(kind: IntegrationKind, configured: boolean, overrides: Partial<IntegrationItem> = {}): IntegrationItem {
    return {
        kind,
        configured,
        hint: configured ? '…1a2b' : null,
        public: configured ? PUBLIC_FIELDS[kind] : {},
        verifiedAt: configured ? '2026-11-22T12:00:00.000Z' : null,
        ...overrides
    };
}

export function integrationsView(configured: readonly IntegrationKind[] = []): IntegrationsView {
    return {
        items: (['llm', 'whatsapp', 'google'] as const).map((kind: IntegrationKind): IntegrationItem =>
            integrationItem(kind, configured.includes(kind))
        ),
        webhookUrl: WEBHOOK_URL,
        googleRedirectUri: REDIRECT_URL
    };
}
