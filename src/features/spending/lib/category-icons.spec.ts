import { describe, expect, it } from 'vitest';
import { ICON_KEYS } from '../types';
import { CATEGORY_ICONS, categoryIcon, isIconKey } from './category-icons';

describe('category-icons', () => {
    it('tem os 24 ícones da API, sem repetir', () => {
        expect(ICON_KEYS).toHaveLength(24);
        expect(new Set(ICON_KEYS).size).toBe(24);
        expect(Object.keys(CATEGORY_ICONS).sort()).toEqual([...ICON_KEYS].sort());
    });

    it('reconhece só chaves do mapa', () => {
        expect(isIconKey('Home')).toBe(true);
        expect(isIconKey('Rocket')).toBe(false);
    });

    it('cai num ícone padrão quando a chave é desconhecida', () => {
        expect(categoryIcon('Rocket')).toBe(CATEGORY_ICONS.CircleEllipsis);
        expect(categoryIcon('Car')).toBe(CATEGORY_ICONS.Car);
    });
});
