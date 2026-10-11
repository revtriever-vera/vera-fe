import type { ChangeEvent, ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatRateBps } from '../../lib/format-bps';

export const MIN_GOAL_PERCENT: number = 5;
export const MAX_GOAL_PERCENT: number = 60;
const BPS_PER_PERCENT: number = 100;

export interface GoalSliderProps {
    readonly valueBps: number;
    readonly onChange: (bps: number) => void;
}

export function GoalSlider({ valueBps, onChange }: GoalSliderProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    const percentText: string = formatRateBps(valueBps, locale);
    const change = (event: ChangeEvent<HTMLInputElement>): void => {
        onChange(Number(event.target.value) * BPS_PER_PERCENT);
    };
    return (
        <div className="flex items-center gap-4">
            <input
                type="range"
                min={MIN_GOAL_PERCENT}
                max={MAX_GOAL_PERCENT}
                step={1}
                value={valueBps / BPS_PER_PERCENT}
                aria-label={t('goal.sliderLabel')}
                aria-valuetext={t('goal.valueText', { percent: percentText })}
                onChange={change}
                className="h-2 w-full min-w-0 cursor-pointer accent-accent-strong"
            />
            <span aria-hidden="true" className="numeric w-16 shrink-0 text-right text-2xl font-extrabold text-accent-strong">
                {percentText}
            </span>
        </div>
    );
}
