import { GOAL_STATUS, type GoalHoldingView, type GoalView } from '../types';

export function hasBehindGoalWithHolding(goals: readonly GoalView[]): boolean {
    return goals.some(
        (goal: GoalView): boolean =>
            (goal.status === GOAL_STATUS.behind || goal.status === GOAL_STATUS.overdue) &&
            goal.holdings.some((holding: GoalHoldingView): boolean => !holding.removed)
    );
}
