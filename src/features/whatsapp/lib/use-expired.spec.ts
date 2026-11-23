import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useExpired } from './use-expired';

afterEach(() => {
    vi.useRealTimers();
});

describe('useExpired', () => {
    it('vira verdadeiro quando o prazo chega', () => {
        vi.useFakeTimers({ now: new Date('2026-11-22T12:00:00.000Z') });
        const { result } = renderHook(() => useExpired('2026-11-22T12:00:05.000Z'));
        expect(result.current).toBe(false);

        act(() => {
            vi.advanceTimersByTime(6000);
        });

        expect(result.current).toBe(true);
    });

    it('já nasce vencido com prazo no passado e nunca vence sem prazo', () => {
        expect(renderHook(() => useExpired('2020-01-01T00:00:00.000Z')).result.current).toBe(true);
        expect(renderHook(() => useExpired(null)).result.current).toBe(false);
    });

    it('aceita prazos além do limite do temporizador', () => {
        vi.useFakeTimers({ now: new Date('2026-11-22T12:00:00.000Z') });
        const { result } = renderHook(() => useExpired('2099-01-01T00:00:00.000Z'));
        expect(result.current).toBe(false);
    });
});
