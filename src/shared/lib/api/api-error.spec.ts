import { describe, expect, it } from 'vitest';
import { ApiError } from './api-error';

describe('ApiError', () => {
    it('uses the problem details when the response is a recognizable object', () => {
        const error: ApiError = ApiError.fromUnknown(
            { type: 'identity.invalid_code', title: 'InvalidCodeError', status: 401, detail: 'Invalid code.', requestId: 'req-1' },
            401
        );
        expect(error.status).toBe(401);
        expect(error.requestId).toBe('req-1');
        expect(error.message).toBe('Invalid code.');
    });

    it('falls back to a generic problem when the body is not recognizable', () => {
        const error: ApiError = ApiError.fromUnknown(null, 500);
        expect(error.status).toBe(500);
        expect(error.requestId).toBeNull();
        expect(error.problem.type).toBe('about:blank');
    });

    it('extracts the field issues when meta.errors is a valid list', () => {
        const error: ApiError = ApiError.fromUnknown(
            {
                type: 'validation',
                title: 'ValidationError',
                status: 422,
                detail: 'Invalid data.',
                requestId: null,
                meta: { errors: [{ path: ['email'], message: 'required' }] }
            },
            422
        );
        expect(error.fieldIssues()).toEqual([{ path: 'email', message: 'required' }]);
    });

    it('returns an empty list when meta.errors is not an array', () => {
        const error: ApiError = ApiError.fromUnknown(
            { type: 'validation', title: 'ValidationError', status: 422, detail: 'x', requestId: null, meta: { errors: 'not-an-array' } },
            422
        );
        expect(error.fieldIssues()).toEqual([]);
    });

    it('returns an empty list when there is no meta', () => {
        const error: ApiError = ApiError.fromUnknown(null, 500);
        expect(error.fieldIssues()).toEqual([]);
    });
});
