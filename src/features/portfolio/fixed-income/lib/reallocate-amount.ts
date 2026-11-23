const MINOR_PER_UNIT: number = 100;

export function reallocateAmount(reallocateMinor: number): number {
    return reallocateMinor / MINOR_PER_UNIT;
}
