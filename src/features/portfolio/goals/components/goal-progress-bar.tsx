import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { GOAL_STATUS, type GoalStatus } from '../types';

export interface GoalProgressBarProps {
    readonly label: string;
    readonly percent: number;
    readonly status: GoalStatus;
}

const FILL: Readonly<Record<GoalStatus, string>> = {
    [GOAL_STATUS.done]: '[&::-webkit-progress-value]:bg-positive [&::-moz-progress-bar]:bg-positive',
    [GOAL_STATUS.onTrack]: '[&::-webkit-progress-value]:bg-positive [&::-moz-progress-bar]:bg-positive',
    [GOAL_STATUS.behind]: '[&::-webkit-progress-value]:bg-caution [&::-moz-progress-bar]:bg-caution',
    [GOAL_STATUS.overdue]: '[&::-webkit-progress-value]:bg-critical [&::-moz-progress-bar]:bg-critical'
};

export function GoalProgressBar({ label, percent, status }: GoalProgressBarProps): ReactElement {
    return (
        <progress
            aria-label={label}
            value={percent}
            max={100}
            className={cn(
                'h-2 w-full appearance-none overflow-hidden rounded-full bg-surface-muted',
                '[&::-webkit-progress-bar]:bg-surface-muted [&::-webkit-progress-value]:rounded-full',
                FILL[status]
            )}
        />
    );
}
