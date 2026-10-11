const FULL_BPS: number = 10000;
const BPS_PER_PERCENT: number = 100;

export function segmentWidths(bps: readonly number[]): readonly number[] {
    let remaining: number = FULL_BPS;
    return bps.map((value: number): number => {
        const width: number = Math.max(0, Math.min(value, remaining));
        remaining -= width;
        return width / BPS_PER_PERCENT;
    });
}
