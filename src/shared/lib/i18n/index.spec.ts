import { afterEach, describe, expect, it, vi } from 'vitest';

describe('bootstrap do i18next', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetModules();
    });

    it('cai para o locale padrão quando não há navigator (SSR/teste)', async () => {
        vi.stubGlobal('navigator', undefined);

        const { i18n } = await import('./index');

        expect(i18n.language).toBe('pt-BR');
    });
});
