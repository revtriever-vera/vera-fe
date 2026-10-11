import { CLASS_COLOR_KEYS, type ClassColorKey } from '../../types';

export function nextFreeColor(used: readonly ClassColorKey[]): ClassColorKey {
    const usage: ReadonlyMap<ClassColorKey, number> = used.reduce(
        (counts: Map<ClassColorKey, number>, colorKey: ClassColorKey): Map<ClassColorKey, number> =>
            counts.set(colorKey, (counts.get(colorKey) ?? 0) + 1),
        new Map<ClassColorKey, number>()
    );
    const lowest: number = Math.min(...CLASS_COLOR_KEYS.map((colorKey: ClassColorKey): number => usage.get(colorKey) ?? 0));
    return CLASS_COLOR_KEYS.find((colorKey: ClassColorKey): boolean => (usage.get(colorKey) ?? 0) === lowest) ?? CLASS_COLOR_KEYS[0];
}
