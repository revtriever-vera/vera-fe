import type { CatalogAsset } from '../types';

export type ExposureKind = 'etf' | 'bdr' | 'generic';

export function exposureKind(asset: Pick<CatalogAsset, 'dollarExposure' | 'kind' | 'market'>): ExposureKind | null {
    if (!asset.dollarExposure || asset.market !== 'B3') {
        return null;
    }
    if (asset.kind === 'etf') {
        return 'etf';
    }
    return asset.kind === 'bdr' ? 'bdr' : 'generic';
}
