import { describe, expect, it } from 'vitest';
import { BITCOIN, IVVB11, catalogAsset } from '../../../../../test/fixtures/assets';
import { exposureKind } from './exposure-note';

describe('exposureKind', () => {
    it('distingue ETF, BDR e outros ativos da B3 com exposição ao dólar', () => {
        expect(exposureKind(IVVB11)).toBe('etf');
        expect(exposureKind(catalogAsset({ kind: 'bdr', dollarExposure: true }))).toBe('bdr');
        expect(exposureKind(catalogAsset({ kind: 'stock', dollarExposure: true }))).toBe('generic');
    });

    it('não avisa sem exposição ou fora da B3', () => {
        expect(exposureKind(catalogAsset())).toBeNull();
        expect(exposureKind(BITCOIN)).toBeNull();
        expect(exposureKind(catalogAsset({ market: 'US', dollarExposure: true }))).toBeNull();
    });
});
