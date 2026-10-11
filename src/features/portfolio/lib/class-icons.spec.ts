import { Globe, Hexagon, Layers, Percent } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { SYSTEM_CLASS_KEYS } from '../types';
import { classIcon, isSystemClassKey } from './class-icons';

describe('classIcon', () => {
    it('devolve o ícone da classe padrão', () => {
        expect(classIcon(SYSTEM_CLASS_KEYS.fixedIncomePost)).toBe(Percent);
        expect(classIcon(SYSTEM_CLASS_KEYS.stocksUs)).toBe(Globe);
        expect(classIcon(SYSTEM_CLASS_KEYS.crypto)).toBe(Hexagon);
    });

    it('usa o ícone genérico para classe do usuário ou chave desconhecida', () => {
        expect(classIcon(null)).toBe(Layers);
        expect(classIcon('outra')).toBe(Layers);
    });

    it('reconhece só chaves padrão', () => {
        expect(isSystemClassKey('fii')).toBe(true);
        expect(isSystemClassKey('toString')).toBe(false);
    });
});
