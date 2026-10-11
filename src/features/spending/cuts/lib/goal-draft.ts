import { useState } from 'react';

export interface GoalDraft {
    readonly savedBps: number;
    readonly draftBps: number;
    readonly dirty: boolean;
}

export interface GoalDraftControls extends GoalDraft {
    readonly set: (bps: number) => void;
    readonly reset: () => void;
}

export const DEFAULT_GOAL_BPS: number = 2000;

export function useGoalDraft(savedBps: number | undefined): GoalDraftControls {
    const [override, setOverride] = useState<number | null>(null);
    const saved: number = savedBps ?? DEFAULT_GOAL_BPS;
    const draft: number = override ?? saved;
    return {
        savedBps: saved,
        draftBps: draft,
        dirty: draft !== saved,
        set: setOverride,
        reset: (): void => {
            setOverride(null);
        }
    };
}
