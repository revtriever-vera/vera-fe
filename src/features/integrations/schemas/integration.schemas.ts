import type { TFunction } from 'i18next';
import { z } from 'zod';
import { INTEGRATION_FIELDS, type IntegrationField } from '../lib/integration-fields';
import type { IntegrationKind } from '../types';

const SECRET_MIN_LENGTH: number = 8;
const SECRET_MAX_LENGTH: number = 512;
const TEXT_MAX_LENGTH: number = 256;
const PRINTABLE_WITHOUT_SPACE: RegExp = /^[\x21-\x7E]+$/;
const GOOGLE_CLIENT_ID: RegExp = /^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/;
const PHONE_NUMBER_ID: RegExp = /^\d{5,20}$/;
const MODEL_NAME: RegExp = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]*$/;
const HTTP_URL: RegExp = /^https?:\/\/\S+$/i;

type IntegrationT = TFunction<'integrations'>;

function required(t: IntegrationT): z.ZodString {
    return z.string().trim().min(1, t('validation.required'));
}

function rule(t: IntegrationT, field: IntegrationField): z.ZodType<string> {
    if (field.secret) {
        return required(t)
            .min(SECRET_MIN_LENGTH, t('validation.secret'))
            .max(SECRET_MAX_LENGTH, t('validation.secret'))
            .regex(PRINTABLE_WITHOUT_SPACE, t('validation.secret'));
    }
    const base: z.ZodString = required(t).max(TEXT_MAX_LENGTH, t('validation.tooLong'));
    const patterns: Readonly<Record<string, [RegExp, string]>> = {
        baseUrl: [HTTP_URL, t('validation.baseUrl')],
        model: [MODEL_NAME, t('validation.model')],
        phoneNumberId: [PHONE_NUMBER_ID, t('validation.phoneNumberId')],
        clientId: [GOOGLE_CLIENT_ID, t('validation.clientId')]
    };
    const pattern: [RegExp, string] | undefined = patterns[field.name];
    return pattern === undefined ? base : base.regex(pattern[0], pattern[1]);
}

export function createIntegrationSchema(t: IntegrationT, kind: IntegrationKind): z.ZodObject<Record<string, z.ZodType<string>>> {
    const shape: Record<string, z.ZodType<string>> = {};
    for (const field of INTEGRATION_FIELDS[kind]) {
        shape[field.name] = rule(t, field);
    }
    return z.object(shape);
}
