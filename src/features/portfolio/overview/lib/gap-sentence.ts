import type { TFunction } from 'i18next';
import { DEVIATION_STATUS, type DeviationStatus } from '../../types';

export function gapSentence(
    t: TFunction<'portfolioOverview'>,
    status: DeviationStatus,
    gapMinor: number,
    money: (minor: number) => string
): string {
    if (status === DEVIATION_STATUS.within) {
        return t('gap.within');
    }
    const amount: string = money(Math.abs(gapMinor));
    return status === DEVIATION_STATUS.below ? t('gap.below', { amount }) : t('gap.above', { amount });
}
