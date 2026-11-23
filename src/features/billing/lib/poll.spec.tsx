import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { INVOICE_POLL_MAX_MS, INVOICE_POLL_MS, pollExpired, usePolling } from './poll';

beforeEach((): void => {
    vi.useFakeTimers();
});

afterEach((): void => {
    vi.useRealTimers();
});

describe('usePolling', () => {
    it('chama o tick a cada intervalo e para ao desativar', () => {
        const tick: Mock<() => void> = vi.fn<() => void>();
        const { rerender } = renderHook(
            ({ active }: { active: boolean }) => usePolling({ active, everyMs: INVOICE_POLL_MS, maxMs: INVOICE_POLL_MAX_MS, tick }),
            {
                initialProps: { active: true }
            }
        );

        vi.advanceTimersByTime(INVOICE_POLL_MS * 2);
        expect(tick).toHaveBeenCalledTimes(2);
        rerender({ active: false });
        vi.advanceTimersByTime(INVOICE_POLL_MS * 5);

        expect(tick).toHaveBeenCalledTimes(2);
    });

    it('para ao desmontar (janela fechada)', () => {
        const tick: Mock<() => void> = vi.fn<() => void>();
        const { unmount } = renderHook(() => usePolling({ active: true, everyMs: 1000, maxMs: 60_000, tick }));

        unmount();
        vi.advanceTimersByTime(10_000);

        expect(tick).not.toHaveBeenCalled();
    });

    it('desiste depois do tempo máximo e avisa', () => {
        const tick: Mock<() => void> = vi.fn<() => void>();
        const { result } = renderHook(() => usePolling({ active: true, everyMs: 1000, maxMs: 3000, tick }));

        act((): void => {
            vi.advanceTimersByTime(4000);
        });

        expect(result.current).toBe(true);
        const calls: number = tick.mock.calls.length;
        vi.advanceTimersByTime(5000);
        expect(tick).toHaveBeenCalledTimes(calls);
    });
});

describe('pollExpired', () => {
    it('expira quando passa o máximo', () => {
        expect(pollExpired(0, 999, 1000)).toBe(false);
        expect(pollExpired(0, 1000, 1000)).toBe(true);
    });
});
