import { describe, expect, it } from 'vitest';
import enPortfolio from '@/shared/lib/i18n/resources/en/portfolio.json';
import ptBRPortfolio from '@/shared/lib/i18n/resources/pt-BR/portfolio.json';
import { ISSUER_BUCKET_KEYS, SECTOR_KEYS } from '../types';
import { isSectorKey, UNMAPPED_SECTOR } from './sector-keys';

describe('chaves de setor', () => {
    it('todas as chaves da lista fechada existem nos dois idiomas, mais o setor sem catálogo', () => {
        const expected: string[] = [...SECTOR_KEYS, UNMAPPED_SECTOR].sort();
        expect(Object.keys(ptBRPortfolio.sectors).sort()).toEqual(expected);
        expect(Object.keys(enPortfolio.sectors).sort()).toEqual(expected);
    });

    it('todos os buckets de emissor existem nos dois idiomas', () => {
        const expected: string[] = [...ISSUER_BUCKET_KEYS].sort();
        expect(Object.keys(ptBRPortfolio.concentration.buckets).sort()).toEqual(expected);
        expect(Object.keys(enPortfolio.concentration.buckets).sort()).toEqual(expected);
    });

    it('reconhece só chaves da lista', () => {
        expect(isSectorKey('financeiro')).toBe(true);
        expect(isSectorKey(UNMAPPED_SECTOR)).toBe(false);
        expect(isSectorKey('outro')).toBe(false);
    });
});
