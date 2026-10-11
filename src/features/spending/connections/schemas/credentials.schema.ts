import type { TFunction } from 'i18next';
import { z } from 'zod';
import { isUuid, parseItemIds, type ParsedItemIds } from '../lib/parse-item-ids';
import { ITEM_ID_LIMIT } from '../types';

export type CredentialsFormMode = 'full' | 'rotate' | 'items';

export interface CredentialsFormInput {
    clientId: string;
    clientSecret: string;
    itemIds: string;
}

type Translate = TFunction<'spendingConnections'>;

function checkCredentials(value: CredentialsFormInput, context: z.RefinementCtx, t: Translate): void {
    if (!isUuid(value.clientId.trim().toLowerCase())) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['clientId'], message: t('credentials.errors.clientIdInvalid') });
    }
    if (value.clientSecret.length === 0) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['clientSecret'], message: t('credentials.errors.clientSecretRequired') });
    }
}

function itemsMessage(parsed: ParsedItemIds, t: Translate): string | null {
    if (parsed.invalid.length > 0) {
        return t('credentials.errors.itemIdsInvalid');
    }
    if (parsed.valid.length === 0) {
        return t('credentials.errors.itemIdsRequired');
    }
    return parsed.valid.length > ITEM_ID_LIMIT ? t('credentials.errors.itemIdsTooMany', { max: ITEM_ID_LIMIT }) : null;
}

function checkItems(value: CredentialsFormInput, context: z.RefinementCtx, t: Translate): void {
    const message: string | null = itemsMessage(parseItemIds(value.itemIds), t);
    if (message !== null) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['itemIds'], message });
    }
}

export function createCredentialsSchema(t: Translate, mode: CredentialsFormMode): z.ZodType<CredentialsFormInput> {
    return z
        .object({ clientId: z.string(), clientSecret: z.string(), itemIds: z.string() })
        .superRefine((value: CredentialsFormInput, context: z.RefinementCtx): void => {
            if (mode !== 'items') {
                checkCredentials(value, context, t);
            }
            if (mode !== 'rotate') {
                checkItems(value, context, t);
            }
        });
}
