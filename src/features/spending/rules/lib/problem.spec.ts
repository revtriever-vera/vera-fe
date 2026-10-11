import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { conflictRuleId, problemCode } from './problem';

function apiError(type: string, meta?: Record<string, unknown>): ApiError {
    return new ApiError({ type, title: 'x', status: 409, detail: 'd', requestId: null, ...(meta === undefined ? {} : { meta }) });
}

describe('problem', () => {
    it('lê o código só de ApiError', () => {
        expect(problemCode(apiError('categories.name_taken'))).toBe('categories.name_taken');
        expect(problemCode(new Error('x'))).toBeNull();
    });

    it('lê o ruleId só do conflito de regra', () => {
        expect(conflictRuleId(apiError('categories.rule_conflict', { ruleId: 'r1' }))).toBe('r1');
        expect(conflictRuleId(apiError('categories.rule_conflict'))).toBeNull();
        expect(conflictRuleId(apiError('categories.rule_conflict', { ruleId: 3 }))).toBeNull();
        expect(conflictRuleId(apiError('categories.name_taken', { ruleId: 'r1' }))).toBeNull();
        expect(conflictRuleId(new Error('x'))).toBeNull();
    });
});
