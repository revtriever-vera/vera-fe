import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';

export type GoalsErrorKey =
    | 'errors.generic'
    | 'errors.validationFailed'
    | 'errors.holdingNotFound'
    | 'errors.holdingOverallocated'
    | 'errors.emergencyReserveExists'
    | 'errors.targetDateInPast'
    | 'errors.limitReached'
    | 'errors.goalNotFound'
    | 'errors.reserveMonthsNotAllowed';

export const GOALS_ERROR_KEYS: Readonly<Record<string, GoalsErrorKey>> = {
    validation_failed: 'errors.validationFailed',
    'goals.holding_not_found': 'errors.holdingNotFound',
    'goals.holding_overallocated': 'errors.holdingOverallocated',
    'goals.emergency_reserve_exists': 'errors.emergencyReserveExists',
    'goals.target_date_in_past': 'errors.targetDateInPast',
    'goals.limit_reached': 'errors.limitReached',
    'goals.goal_not_found': 'errors.goalNotFound',
    'goals.reserve_months_not_allowed': 'errors.reserveMonthsNotAllowed'
};

export function goalsErrorMessage(t: TFunction<'portfolioGoals'>, error: Error | null): string {
    const key: GoalsErrorKey | undefined = error instanceof ApiError ? GOALS_ERROR_KEYS[error.problem.type] : undefined;
    return t(key ?? 'errors.generic');
}
