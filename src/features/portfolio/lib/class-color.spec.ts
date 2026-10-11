import { describe, expect, it } from 'vitest';
import { CLASS_COLOR_KEYS } from '../types';
import { colorTokenName, toClassColorKey } from './class-color';

describe('toClassColorKey', () => {
    it.each(CLASS_COLOR_KEYS)('aceita %s', (key: string) => {
        expect(toClassColorKey(key)).toBe(key);
    });

    it('cai na primeira cor quando a chave é desconhecida', () => {
        expect(toClassColorKey('c13')).toBe('c1');
        expect(toClassColorKey('')).toBe('c1');
    });
});

describe('colorTokenName', () => {
    it('mapeia cN para o token class-N', () => {
        expect(colorTokenName('c1')).toBe('--color-class-1');
        expect(colorTokenName('c12')).toBe('--color-class-12');
    });
});
