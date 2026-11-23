import type { ParseKeys } from 'i18next';
import { INTEGRATION_KIND, type IntegrationFormValues, type IntegrationItem, type IntegrationKind } from '../types';

export type IntegrationsKey = ParseKeys<'integrations'>;

export interface IntegrationField {
    readonly name: string;
    readonly labelKey: IntegrationsKey;
    readonly secret: boolean;
}

export const INTEGRATION_FIELDS: Readonly<Record<IntegrationKind, readonly IntegrationField[]>> = {
    [INTEGRATION_KIND.llm]: [
        { name: 'baseUrl', labelKey: 'fields.baseUrl', secret: false },
        { name: 'apiKey', labelKey: 'fields.apiKey', secret: true },
        { name: 'model', labelKey: 'fields.model', secret: false }
    ],
    [INTEGRATION_KIND.whatsapp]: [
        { name: 'accessToken', labelKey: 'fields.accessToken', secret: true },
        { name: 'phoneNumberId', labelKey: 'fields.phoneNumberId', secret: false },
        { name: 'verifyToken', labelKey: 'fields.verifyToken', secret: true },
        { name: 'appSecret', labelKey: 'fields.appSecret', secret: true }
    ],
    [INTEGRATION_KIND.google]: [
        { name: 'clientId', labelKey: 'fields.clientId', secret: false },
        { name: 'clientSecret', labelKey: 'fields.clientSecret', secret: true }
    ]
};

export function initialFormValues(kind: IntegrationKind, item: IntegrationItem | undefined): IntegrationFormValues {
    const entries: [string, string][] = INTEGRATION_FIELDS[kind].map((field: IntegrationField): [string, string] => [
        field.name,
        field.secret ? '' : (item?.public[field.name as keyof IntegrationItem['public']] ?? '')
    ]);
    return Object.fromEntries(entries);
}

export function lastCharacters(hint: string | null): string | null {
    return hint === null ? null : hint.replace(/^[….\s]+/, '');
}
