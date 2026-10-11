import { describe, expect, it } from 'vitest';
import { stepOfPath } from './step-of-path';

describe('stepOfPath', () => {
    it.each([
        ['/onboarding', 'welcome'],
        ['/onboarding/assets', 'assets'],
        ['/onboarding/banks', 'banks'],
        ['/onboarding/done', 'done'],
        ['/outra', 'welcome']
    ])('mapeia %s para %s', (pathname: string, expected: string) => {
        expect(stepOfPath(pathname)).toBe(expected);
    });
});
