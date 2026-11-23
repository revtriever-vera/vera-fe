import { useEffect, useState } from 'react';

const MAX_TIMEOUT_MS: number = 2_147_483_647;

export function useExpired(expiresAt: string | null): boolean {
    const target: number = expiresAt === null ? Number.POSITIVE_INFINITY : new Date(expiresAt).getTime();
    const [now, setNow] = useState<number>((): number => Date.now());
    useEffect((): (() => void) | undefined => {
        const remaining: number = target - Date.now();
        if (!Number.isFinite(remaining)) {
            return undefined;
        }
        const timer: number = window.setTimeout(
            (): void => {
                setNow(Date.now());
            },
            Math.min(Math.max(remaining, 0) + 1, MAX_TIMEOUT_MS)
        );
        return (): void => {
            window.clearTimeout(timer);
        };
    }, [target]);
    return now >= target;
}
