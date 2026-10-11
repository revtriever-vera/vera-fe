import { afterEach, describe, expect, it, vi } from 'vitest';
import { readTutorialProgress, writeTutorialProgress } from './tutorial-progress';

afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
});

describe('tutorial-progress', () => {
    it('guarda e lê os passos por empresa', () => {
        writeTutorialProgress('company-1', [1, 3]);

        expect(readTutorialProgress('company-1')).toEqual([1, 3]);
        expect(readTutorialProgress('company-2')).toEqual([]);
        expect(window.localStorage.getItem('vera.spending.tutorial.company-1')).toBe('[1,3]');
    });

    it('ignora passos fora do intervalo e valores que não são lista', () => {
        window.localStorage.setItem('vera.spending.tutorial.company-1', '[0,2,9,"x"]');
        expect(readTutorialProgress('company-1')).toEqual([2]);
        window.localStorage.setItem('vera.spending.tutorial.company-1', '{"a":1}');
        expect(readTutorialProgress('company-1')).toEqual([]);
        window.localStorage.setItem('vera.spending.tutorial.company-1', 'não é json');
        expect(readTutorialProgress('company-1')).toEqual([]);
    });

    it('funciona sem armazenamento', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('bloqueado');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('bloqueado');
        });

        expect(readTutorialProgress('company-1')).toEqual([]);
        expect(() => {
            writeTutorialProgress('company-1', [1]);
        }).not.toThrow();
    });
});
