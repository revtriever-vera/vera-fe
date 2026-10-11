import { CLASS_COLOR_KEYS, type ClassColorKey } from '../types';

const FALLBACK_COLOR_KEY: ClassColorKey = 'c1';

function isClassColorKey(value: string): value is ClassColorKey {
    return (CLASS_COLOR_KEYS as readonly string[]).includes(value);
}

export function toClassColorKey(value: string): ClassColorKey {
    return isClassColorKey(value) ? value : FALLBACK_COLOR_KEY;
}

export function colorTokenName(colorKey: ClassColorKey): string {
    return `--color-class-${colorKey.slice(1)}`;
}
