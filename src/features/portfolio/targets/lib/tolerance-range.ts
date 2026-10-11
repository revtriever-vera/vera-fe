const FULL_BPS: number = 10000;

export interface ToleranceRange {
    readonly lowerBps: number;
    readonly upperBps: number;
}

export function toleranceRange(targetBps: number, toleranceBps: number): ToleranceRange {
    return {
        lowerBps: Math.max(0, targetBps - toleranceBps),
        upperBps: Math.min(FULL_BPS, targetBps + toleranceBps)
    };
}
