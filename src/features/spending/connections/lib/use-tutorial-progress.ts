import { useCallback, useState } from 'react';
import { readTutorialProgress, writeTutorialProgress } from './tutorial-progress';

export interface TutorialProgress {
    readonly done: ReadonlySet<number>;
    readonly toggle: (step: number) => boolean;
}

export function useTutorialProgress(companyId: string): TutorialProgress {
    const [done, setDone] = useState<ReadonlySet<number>>((): ReadonlySet<number> => new Set<number>(readTutorialProgress(companyId)));
    const toggle: TutorialProgress['toggle'] = useCallback(
        (step: number): boolean => {
            const next: Set<number> = new Set<number>(done);
            const checked: boolean = !next.delete(step);
            if (checked) {
                next.add(step);
            }
            setDone(next);
            writeTutorialProgress(companyId, [...next].sort());
            return checked;
        },
        [companyId, done]
    );
    return { done, toggle };
}
