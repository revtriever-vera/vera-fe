import { describe, expect, it } from 'vitest';
import { confirmWordMatches } from './confirm-word';

describe('confirmWordMatches', () => {
    it.each([
        ['EXCLUIR', true],
        ['excluir', true],
        ['  Excluir ', true],
        ['', false],
        ['EXCLUI', false],
        ['EXCLUIR TUDO', false]
    ])('%j -> %s', (typed: string, expected: boolean): void => {
        expect(confirmWordMatches(typed, 'EXCLUIR')).toBe(expected);
    });
});
