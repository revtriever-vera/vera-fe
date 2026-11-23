import type { GoalHoldingView, GoalKind, GoalView } from '../types';

export interface HoldingGoalLink {
    readonly goalId: string;
    readonly name: string;
    readonly kind: GoalKind;
    readonly shareBps: number;
}

export function holdingGoalLinks(goals: readonly GoalView[], kind: GoalHoldingView['kind'], holdingId: string): readonly HoldingGoalLink[] {
    return goals.flatMap((goal: GoalView): readonly HoldingGoalLink[] =>
        goal.holdings
            .filter((holding: GoalHoldingView): boolean => !holding.removed && holding.kind === kind && holding.holdingId === holdingId)
            .map((holding: GoalHoldingView): HoldingGoalLink => ({
                goalId: goal.id,
                name: goal.name,
                kind: goal.kind,
                shareBps: holding.shareBps
            }))
    );
}
