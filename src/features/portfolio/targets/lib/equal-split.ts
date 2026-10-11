const FULL_BPS: number = 10000;

export function equalSplitBps(count: number): readonly number[] {
    if (count <= 0) {
        return [];
    }
    const base: number = Math.floor(FULL_BPS / count);
    const remainder: number = FULL_BPS - base * count;
    return Array.from({ length: count }, (_unused: unknown, index: number): number => (index < remainder ? base + 1 : base));
}
