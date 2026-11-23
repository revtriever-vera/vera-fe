import type { SupportedLocale } from '@/shared/lib/locale';
import { formatTargetBps } from '../../lib/format-bps';

const MINUS_SIGN: string = '−';
const PLUS_SIGN: string = '+';

export function signSymbol(value: number): string {
    return value < 0 ? MINUS_SIGN : PLUS_SIGN;
}

export function formatSignedPercentBps(bps: number, locale: SupportedLocale): string {
    return `${signSymbol(bps)}${formatTargetBps(Math.abs(bps), locale)}`;
}
