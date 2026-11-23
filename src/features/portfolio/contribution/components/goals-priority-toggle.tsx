import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Switch } from '@/shared/ui/switch';
import { useGoals } from '../../goals/api/use-goals.query';
import { hasBehindGoalWithHolding } from '../../goals/lib/behind-goals';
import type { GoalsList } from '../../goals/types';

export interface GoalsPriorityToggleProps {
    readonly checked: boolean;
    readonly onChange: (next: boolean) => void;
}

export function GoalsPriorityToggle({ checked, onChange }: GoalsPriorityToggleProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const goals: UseQueryResult<GoalsList> = useGoals();
    if (goals.data === undefined || !hasBehindGoalWithHolding(goals.data.items)) {
        return null;
    }
    return (
        <div className="surface-card flex items-center justify-between gap-4 p-4">
            <div className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold">{t('goals.toggleLabel')}</span>
                <span className="text-xs text-content-muted">{t('goals.toggleHint')}</span>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} label={t('goals.toggleLabel')} />
        </div>
    );
}
