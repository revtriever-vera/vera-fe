import type { TFunction } from 'i18next';
import { issuerLabel } from '../../concentration/lib/bucket-label';
import { ISSUER_BUCKET_KEYS } from '../../concentration/types';
import type { IssuerRow } from '../types';

function isBucket(key: string): boolean {
    return (ISSUER_BUCKET_KEYS as readonly string[]).includes(key);
}

export function reviewIssuerLabel(t: TFunction<'portfolio'>, row: IssuerRow): string {
    return issuerLabel(t, { key: row.key, name: row.name, kind: isBucket(row.key) ? 'bucket' : 'group' });
}
