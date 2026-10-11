export interface GaugePositions {
    readonly fill: number;
    readonly mark: number;
}

const HEADROOM: number = 1.25;
const MIN_SCALE_BPS: number = 100;
const PERCENT: number = 100;

export function gaugePositions(shareBps: number, targetBps: number): GaugePositions {
    const max: number = Math.max(shareBps, targetBps, MIN_SCALE_BPS) * HEADROOM;
    return { fill: (shareBps / max) * PERCENT, mark: (targetBps / max) * PERCENT };
}
