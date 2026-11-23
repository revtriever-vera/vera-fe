import type { paths } from '@/shared/lib/api/schema';

export type GoalsList = paths['/goals']['get']['responses']['200']['content']['application/json'];
export type GoalView = GoalsList['items'][number];
export type GoalHoldingView = GoalView['holdings'][number];
export type GoalKind = GoalView['kind'];
export type GoalStatus = GoalView['status'];
export type GoalReserveView = NonNullable<GoalView['reserve']>;
export type CreateGoalBody = paths['/goals']['post']['requestBody']['content']['application/json'];
export type UpdateGoalBody = paths['/goals/{id}']['patch']['requestBody']['content']['application/json'];
export type GoalHoldingBody = CreateGoalBody['holdings'][number];
export type EmergencySuggestion = paths['/goals/emergency-suggestion']['get']['responses']['200']['content']['application/json'];

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

export const GOAL_MODEL_KINDS = [GOAL_KIND.emergencyReserve, GOAL_KIND.travel, GOAL_KIND.homeDownPayment, GOAL_KIND.other] as const;

export const RESERVE_MONTHS_CHOICES = [3, 6, 12] as const;

export type ReserveMonths = (typeof RESERVE_MONTHS_CHOICES)[number];

export const DEFAULT_RESERVE_MONTHS: ReserveMonths = 6;

export const FULL_SHARE_BPS: number = 10000;

export const MAX_GOAL_NAME_LENGTH: number = 60;
