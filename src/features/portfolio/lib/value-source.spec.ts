import { describe, expect, it } from 'vitest';
import { isEstimatedSource, valueSourceKey } from './value-source';

describe('valueSourceKey', () => {
    it('mapeia a fonte para a chave de tradução', () => {
        expect(valueSourceKey('brapi')).toBe('sources.brapi');
        expect(valueSourceKey('cvm')).toBe('sources.cvm');
        expect(valueSourceKey('curve_ipca')).toBe('sources.curve_ipca');
    });
});

describe('isEstimatedSource', () => {
    it('marca só as curvas como estimativa', () => {
        expect(isEstimatedSource('curve_cdi')).toBe(true);
        expect(isEstimatedSource('curve_pre')).toBe(true);
        expect(isEstimatedSource('brapi')).toBe(false);
        expect(isEstimatedSource('tesouro_direto')).toBe(false);
        expect(isEstimatedSource('cvm')).toBe(false);
    });
});
