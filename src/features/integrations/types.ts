import type { paths } from '@/shared/lib/api/schema';

export type IntegrationsView = paths['/integrations']['get']['responses']['200']['content']['application/json'];
export type IntegrationItem = IntegrationsView['items'][number];
export type IntegrationKind = IntegrationItem['kind'];
export type SaveLlmBody = paths['/integrations/llm']['put']['requestBody']['content']['application/json'];
export type SaveWhatsAppBody = paths['/integrations/whatsapp']['put']['requestBody']['content']['application/json'];
export type SaveGoogleBody = paths['/integrations/google']['put']['requestBody']['content']['application/json'];

export const INTEGRATION_KIND = {
    llm: 'llm',
    whatsapp: 'whatsapp',
    google: 'google'
} as const satisfies Record<IntegrationKind, IntegrationKind>;

export const INTEGRATION_KINDS: readonly IntegrationKind[] = [INTEGRATION_KIND.llm, INTEGRATION_KIND.whatsapp, INTEGRATION_KIND.google];

export type SaveIntegrationVariables =
    | { readonly kind: 'llm'; readonly body: SaveLlmBody }
    | { readonly kind: 'whatsapp'; readonly body: SaveWhatsAppBody }
    | { readonly kind: 'google'; readonly body: SaveGoogleBody };

export type IntegrationFormValues = Readonly<Record<string, string>>;
