import { ApiError } from '@/shared/lib/api/api-error';

export const RULE_CONFLICT_CODE: string = 'categories.rule_conflict';
export const INVALID_RULE_CODE: string = 'categories.invalid_rule';
export const NAME_TAKEN_CODE: string = 'categories.name_taken';
export const LIMIT_REACHED_CODE: string = 'categories.limit_reached';

export function problemCode(error: Error): string | null {
    return error instanceof ApiError ? error.problem.type : null;
}

export function conflictRuleId(error: Error): string | null {
    if (!(error instanceof ApiError) || error.problem.type !== RULE_CONFLICT_CODE) {
        return null;
    }
    const id: unknown = error.problem.meta?.['ruleId'];
    return typeof id === 'string' ? id : null;
}
