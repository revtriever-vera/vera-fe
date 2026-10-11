import { describe, expect, it } from 'vitest';
import { initialsOf } from './initials';

describe('initialsOf', () => {
    it.each([
        ['Nubank', 'Nu'],
        ['Banco Inter', 'BI'],
        ['  banco   do brasil ', 'BD'],
        ['X', 'X'],
        ['', '•'],
        [null, '•']
    ])('%s vira %s', (name: string | null, expected: string) => {
        expect(initialsOf(name)).toBe(expected);
    });
});
