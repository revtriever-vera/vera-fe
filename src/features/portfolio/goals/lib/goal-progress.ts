const FULL: number = 100;

export function progressPercent(balanceMinor: number, targetMinor: number): number {
    if (targetMinor <= 0) {
        return 0;
    }
    return Math.min(FULL, Math.max(0, Math.floor((balanceMinor / targetMinor) * FULL)));
}

export function signedDelta(deltaMinor: number): { readonly sign: 'gain' | 'loss'; readonly absMinor: number } | null {
    if (deltaMinor === 0) {
        return null;
    }
    return { sign: deltaMinor > 0 ? 'gain' : 'loss', absMinor: Math.abs(deltaMinor) };
}
