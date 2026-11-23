import { describe, expect, it } from 'vitest';
import { hasRole } from './use-role';

describe('hasRole', () => {
    it.each([
        ['owner', 'owner', true],
        ['owner', 'editor', true],
        ['editor', 'owner', false],
        ['editor', 'editor', true],
        ['viewer', 'editor', false],
        ['viewer', 'viewer', true]
    ] as const)('%s against %s is %s', (role, min, expected): void => {
        expect(hasRole(role, min)).toBe(expected);
    });
});
