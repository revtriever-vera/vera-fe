import { SPENDING_CURRENCY } from '../../types';
import { toMajorUnits } from '../../lib/format-bps';

export function contributionAmount(surplusMinor: number): number | null {
    const amount: number = Math.floor(toMajorUnits(surplusMinor, SPENDING_CURRENCY));
    return amount > 0 ? amount : null;
}

export function contributionLink(surplusMinor: number): string | null {
    const amount: number | null = contributionAmount(surplusMinor);
    return amount === null ? null : `/portfolio/contribution?amount=${String(amount)}`;
}
