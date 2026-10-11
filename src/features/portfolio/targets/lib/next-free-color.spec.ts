import { describe, expect, it } from 'vitest';
import { CLASS_COLOR_KEYS, type ClassColorKey } from '../../types';
import { nextFreeColor } from './next-free-color';

describe('nextFreeColor', () => {
    it('devolve a primeira cor quando nada está em uso', () => {
        expect(nextFreeColor([])).toBe('c1');
    });

    it('devolve a menor cor ainda livre', () => {
        expect(nextFreeColor(['c1', 'c2', 'c3', 'c5'])).toBe('c4');
    });

    it('com as oito classes padrão sugere a nona cor', () => {
        const used: ClassColorKey[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];

        expect(nextFreeColor(used)).toBe('c9');
    });

    it('com as doze em uso volta a ciclar pela menos usada', () => {
        const used: ClassColorKey[] = [...CLASS_COLOR_KEYS, 'c1', 'c2'];

        expect(nextFreeColor(used)).toBe('c3');
    });

    it('com as doze usadas uma vez devolve a primeira', () => {
        expect(nextFreeColor([...CLASS_COLOR_KEYS])).toBe('c1');
    });
});
