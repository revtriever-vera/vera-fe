import { useEffect, useRef, useState, type RefObject } from 'react';

export const PREMIUM_POLL_MS: number = 5000;
export const PREMIUM_POLL_MAX_MS: number = 10 * 60 * 1000;
export const INVOICE_POLL_MS: number = 3000;
export const INVOICE_POLL_MAX_MS: number = 2 * 60 * 1000;

export interface PollOptions {
    readonly active: boolean;
    readonly everyMs: number;
    readonly maxMs: number;
    readonly tick: () => void;
}

export function pollExpired(startedAt: number, now: number, maxMs: number): boolean {
    return now - startedAt >= maxMs;
}

export function usePolling({ active, everyMs, maxMs, tick }: PollOptions): boolean {
    const [expired, setExpired] = useState<boolean>(false);
    const latest: RefObject<() => void> = useRef<() => void>(tick);
    useEffect((): void => {
        latest.current = tick;
    }, [tick]);
    useEffect((): (() => void) | undefined => {
        if (!active) {
            return undefined;
        }
        const startedAt: number = Date.now();
        const id: ReturnType<typeof setInterval> = setInterval((): void => {
            if (pollExpired(startedAt, Date.now(), maxMs)) {
                clearInterval(id);
                setExpired(true);
                return;
            }
            latest.current();
        }, everyMs);
        return (): void => {
            clearInterval(id);
            setExpired(false);
        };
    }, [active, everyMs, maxMs]);
    return expired;
}
