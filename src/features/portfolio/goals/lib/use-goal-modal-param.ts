import { useNavigate, useSearch, type UseNavigateResult } from '@tanstack/react-router';
import { z } from 'zod';
import { GOAL_CREATE_KINDS, type GoalCreateKind } from '../types';

export interface GoalModalParam {
    readonly create?: GoalCreateKind;
    readonly edit?: string;
}

const modalSchema: z.ZodType<GoalModalParam, z.ZodTypeDef, unknown> = z.object({
    create: z.enum(GOAL_CREATE_KINDS).optional().catch(undefined),
    edit: z.string().uuid().optional().catch(undefined)
});

export function useGoalModalParam(): GoalModalParam {
    return useSearch({
        strict: false,
        select: (search: Record<string, unknown>): GoalModalParam => modalSchema.parse(search)
    });
}

export function useCloseGoalModal(): () => void {
    const navigate: UseNavigateResult<string> = useNavigate();
    return (): void => {
        void navigate({
            to: '.',
            search: (previous: Record<string, unknown>): Record<string, unknown> => ({ ...previous, create: undefined, edit: undefined }),
            replace: true
        });
    };
}
