import type { GoalHoldingView, GoalKind, GoalView } from '../types';

export interface HoldingGoalLink {
    readonly goalId: string;
    readonly name: string;
    readonly kind: GoalKind;
    readonly shareBps: number;
}

export function holdingGoalLinks(goals: readonly GoalView[], kind: GoalHoldingView['kind'], holdingId: string): readonly HoldingGoalLink[] {
    const links: HoldingGoalLink[] = [];
    for (const goal of goals) {
        for (const holding of goal.holdings) {
            if (holding.removed || holding.kind !== kind || holding.holdingId !== holdingId) continue;
            links.push({ goalId: goal.id, name: goal.name, kind: goal.kind, shareBps: holding.shareBps });
        }
    }
    return links;
}
