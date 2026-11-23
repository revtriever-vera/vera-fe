import type { TFunction } from 'i18next';
import { ISSUER_BUCKET_KEYS, ISSUER_GROUP_KEYS, type IssuerBucketKey, type IssuerGroupKey, type IssuerRow } from '../types';
import { isSectorKey } from './sector-keys';

function isIssuerBucketKey(key: string): key is IssuerBucketKey {
    return (ISSUER_BUCKET_KEYS as readonly string[]).includes(key);
}

function isIssuerGroupKey(key: string): key is IssuerGroupKey {
    return (ISSUER_GROUP_KEYS as readonly string[]).includes(key);
}

export function issuerLabel(t: TFunction<'portfolio'>, row: Pick<IssuerRow, 'key' | 'kind' | 'name'>): string {
    if (row.kind === 'group' && isIssuerGroupKey(row.key)) {
        return t(`concentration.groups.${row.key}`);
    }
    if (row.kind === 'group' && row.name !== null) {
        return row.name;
    }
    return isIssuerBucketKey(row.key) ? t(`concentration.buckets.${row.key}`) : t('concentration.buckets.unmapped');
}

export function sectorLabel(t: TFunction<'portfolio'>, key: string): string {
    return isSectorKey(key) ? t(`sectors.${key}`) : t('sectors.unmapped_sector');
}

export function assetsDetail(t: TFunction<'portfolio'>, assets: readonly string[], moreCount: number): string {
    const names: string = assets.join(', ');
    if (moreCount <= 0) {
        return names;
    }
    return names === '' ? t('concentration.more', { count: moreCount }) : `${names} ${t('concentration.more', { count: moreCount })}`;
}
