import { describe, expect, it } from 'vitest';
import { assetClass, defaultClasses } from '../../../../../test/fixtures/portfolio';
import type { AssetClassView } from '../../types';
import { ADD_ASSET_TYPES, ASSET_TYPE_SPECS, catalogGroupOf, colorKeyForClassKey, isAddAssetType, typeColorKey } from './asset-types';

describe('asset-types', () => {
    it('tem os sete tipos do protótipo, na ordem', () => {
        expect(ADD_ASSET_TYPES).toEqual(['fixed_income', 'tesouro', 'acoes_br', 'fii', 'acoes_eua', 'reits', 'cripto']);
    });

    it('mapeia cada tipo ao grupo da busca, e renda fixa a nenhum', () => {
        expect(catalogGroupOf('fixed_income')).toBeNull();
        expect(catalogGroupOf('tesouro')).toBe('tesouro');
        expect(catalogGroupOf('acoes_eua')).toBe('acoes_eua');
        expect(ASSET_TYPE_SPECS.cripto.group).toBe('cripto');
    });

    it('reconhece um tipo válido', () => {
        expect(isAddAssetType('fii')).toBe(true);
        expect(isAddAssetType('fundos')).toBe(false);
    });

    it('usa a cor da classe da pessoa e cai para a cor padrão', () => {
        const custom: AssetClassView[] = [assetClass({ id: 'x', systemKey: 'fii', colorKey: 'c11' })];

        expect(typeColorKey(custom, 'fii')).toBe('c11');
        expect(typeColorKey([], 'fii')).toBe('c5');
        expect(typeColorKey(defaultClasses().data, 'cripto')).toBe('c8');
        expect(colorKeyForClassKey([], null)).toBe('c1');
        expect(colorKeyForClassKey([], 'desconhecida')).toBe('c1');
    });
});
