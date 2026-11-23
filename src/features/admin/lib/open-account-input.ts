import type { OpenAccountFormValues } from '../schemas/open-account.schema';
import type { AccessInput, AccessLayer } from '../types';

export const EMPTY_OPEN_ACCOUNT_FORM: OpenAccountFormValues = { reason: '', summary: true, data: false };

export function toAccessInput(values: OpenAccountFormValues): AccessInput {
    const layers: AccessLayer[] = [];
    if (values.summary) {
        layers.push('summary');
    }
    if (values.data) {
        layers.push('data');
    }
    return { reason: values.reason.trim(), layers };
}
