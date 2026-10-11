import { describe, expect, it } from 'vitest';
import { emailsMatch } from './emails-match';

describe('emailsMatch', () => {
    it.each([
        ['maria@example.test', 'maria@example.test', true],
        ['  MARIA@Example.test ', 'maria@example.test', true],
        ['outra@example.test', 'maria@example.test', false],
        ['', 'maria@example.test', false],
        ['   ', '  ', false]
    ])('compares %j with %j', (typed: string, expected: string, result: boolean): void => {
        expect(emailsMatch(typed, expected)).toBe(result);
    });
});
