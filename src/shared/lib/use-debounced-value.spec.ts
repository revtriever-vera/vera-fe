import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './use-debounced-value';

describe('useDebouncedValue', () => {
    beforeEach((): void => {
        vi.useFakeTimers();
    });

    afterEach((): void => {
        vi.useRealTimers();
    });

    it('começa com o valor inicial', () => {
        const { result } = renderHook(({ value }: { value: string }): string => useDebouncedValue(value, 300), {
            initialProps: { value: 'a' }
        });

        expect(result.current).toBe('a');
    });

    it('só entrega o valor novo depois do intervalo sem mudança', () => {
        const { result, rerender } = renderHook(({ value }: { value: string }): string => useDebouncedValue(value, 300), {
            initialProps: { value: 'a' }
        });

        rerender({ value: 'ab' });
        act((): void => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current).toBe('a');

        rerender({ value: 'abc' });
        act((): void => {
            vi.advanceTimersByTime(299);
        });
        expect(result.current).toBe('a');

        act((): void => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe('abc');
    });
});
