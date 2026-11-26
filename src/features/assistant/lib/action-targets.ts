import type { ActionSummary } from '../types';

export interface ActionTarget {
    readonly to: '/portfolio/goals' | '/portfolio/assets' | '/spending/transactions';
    readonly labelKey: 'action.seeGoals' | 'action.seeAssets' | 'action.seeTransactions';
}

const TARGETS: Readonly<Record<string, ActionTarget>> = {
    goal_create: { to: '/portfolio/goals', labelKey: 'action.seeGoals' },
    investment_import: { to: '/portfolio/assets', labelKey: 'action.seeAssets' },
    transaction_categorize: { to: '/spending/transactions', labelKey: 'action.seeTransactions' }
};

export function actionTarget(action: Pick<ActionSummary, 'tool'>): ActionTarget | null {
    return TARGETS[action.tool] ?? null;
}
