import type { paths } from '@/shared/lib/api/schema';

export type GoalsList = paths['/goals']['get']['responses']['200']['content']['application/json'];
export type GoalView = GoalsList['items'][number];
export type GoalHoldingView = GoalView['holdings'][number];
export type GoalKind = GoalView['kind'];
export type GoalStatus = GoalView['status'];

export const GOAL_KIND = {
    emergencyReserve: 'emergency_reserve',
    travel: 'travel',
    homeDownPayment: 'home_down_payment',
    other: 'other'
} as const satisfies Record<string, GoalKind>;

export const GOAL_STATUS = {
    done: 'done',
    overdue: 'overdue',
    behind: 'behind',
    onTrack: 'on_track'
} as const satisfies Record<string, GoalStatus>;

export const GOAL_CREATE_KINDS = [GOAL_KIND.emergencyReserve, GOAL_KIND.other] as const;

export type GoalCreateKind = (typeof GOAL_CREATE_KINDS)[number];

export const GOAL_BASE_CURRENCY: string = 'BRL';
