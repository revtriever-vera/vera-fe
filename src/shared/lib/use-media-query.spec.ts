import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from './use-media-query';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('useMediaQuery', () => {
    it('é falso quando o navegador não tem matchMedia', () => {
        vi.stubGlobal('matchMedia', undefined);
        const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));

        expect(result.current).toBe(false);
    });

    it('segue o resultado do matchMedia e remove o ouvinte ao sair', () => {
        const remove: Mock = vi.fn();
        vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: remove }));
        const { result, unmount } = renderHook(() => useMediaQuery('(max-width: 639px)'));

        expect(result.current).toBe(true);
        unmount();
        expect(remove).toHaveBeenCalledTimes(1);
    });
});
