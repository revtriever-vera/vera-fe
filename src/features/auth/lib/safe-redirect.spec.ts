import { describe, expect, it } from 'vitest';
import { safeRedirect } from './safe-redirect';

describe('safeRedirect', () => {
    it.each(['/ativos', '/portfolio/assets?x=1#topo', '/'])('accepts the internal path %s', (value: string) => {
        expect(safeRedirect(value)).toBe(value);
    });

    it.each([
        ['absolute url', 'https://x'],
        ['protocol relative', '//x'],
        ['backslash', '/\\x'],
        ['script scheme', 'javascript:alert(1)'],
        ['empty', ''],
        ['no leading slash', 'ativos'],
        ['control character', '/a\nb']
    ])('falls back to the root for %s', (_label: string, value: string) => {
        expect(safeRedirect(value)).toBe('/');
    });

    it('falls back to the root when the value is missing', () => {
        expect(safeRedirect(undefined)).toBe('/');
    });
});
