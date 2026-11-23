import type { GoalHoldingView, GoalView, GoalsList } from '@/features/portfolio/goals/types';

export const GOAL_ID_RESERVE: string = '00000000-0000-4000-8000-0000000000a1';
export const GOAL_ID_TRAVEL: string = '00000000-0000-4000-8000-0000000000b2';

export function goalHolding(overrides: Partial<GoalHoldingView> = {}): GoalHoldingView {
    return {
        kind: 'fixed_income',
        holdingId: '00000000-0000-4000-8000-0000000000c1',
        shareBps: 6000,
        removed: false,
        symbol: null,
        name: 'Tesouro Selic 2029',
        valueMinor: 2232000,
        ...overrides
    };
}

export function goal(overrides: Partial<GoalView> = {}): GoalView {
    return {
        id: GOAL_ID_RESERVE,
        kind: 'emergency_reserve',
        name: 'Reserva de emergência',
        targetMinor: 3120000,
        targetDate: '2027-06-15',
        holderUserId: null,
        manualMinor: 0,
        manualUpdatedAt: null,
        balanceMinor: 2232000,
        remainingMinor: 888000,
        monthlyMinor: 126858,
        monthsRemaining: 7,
        status: 'on_track',
        expectedMinor: 2100000,
        planMonthlyMinor: 120000,
        monthDeltaMinor: 38000,
        removedHoldings: 0,
        holdings: [goalHolding()],
        createdAt: '2026-10-01T12:00:00.000Z',
        updatedAt: '2026-11-01T12:00:00.000Z',
        ...overrides
    };
}

export function behindTravel(overrides: Partial<GoalView> = {}): GoalView {
    return goal({
        id: GOAL_ID_TRAVEL,
        kind: 'travel',
        name: 'Viagem',
        targetMinor: 1500000,
        targetDate: '2027-03-10',
        balanceMinor: 400000,
        remainingMinor: 1100000,
        monthlyMinor: 220000,
        monthsRemaining: 5,
        status: 'behind',
        expectedMinor: 700000,
        planMonthlyMinor: 120000,
        monthDeltaMinor: -42000,
        manualMinor: 100000,
        holdings: [goalHolding({ kind: 'position', symbol: 'IVVB11', name: 'iShares S&P 500', shareBps: 2500 })],
        ...overrides
    });
}

export function goalsList(items: readonly GoalView[] = [goal(), behindTravel()]): GoalsList {
    const open: readonly GoalView[] = items.filter((item: GoalView): boolean => item.status !== 'done');
    return {
        items: [...items],
        totals: {
            count: items.length,
            monthlyNeededMinor: open.reduce((sum: number, item: GoalView): number => sum + item.monthlyMinor, 0),
            onTrackCount: items.filter((item: GoalView): boolean => item.status === 'on_track').length,
            behindCount: items.filter((item: GoalView): boolean => item.status === 'behind' || item.status === 'overdue').length,
            doneCount: items.length - open.length
        }
    };
}

export function emptyGoals(): GoalsList {
    return goalsList([]);
}
