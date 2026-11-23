import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { platformRefusal } from './platform-refusal';

function apiError(type: string, status: number): ApiError {
    return ApiError.fromUnknown({ type, title: type, status }, status);
}

describe('platformRefusal', () => {
    it('tells denied from disabled and ignores other failures', () => {
        expect(platformRefusal(apiError('identity.platform_only', 403))).toBe('denied');
        expect(platformRefusal(apiError('identity.platform_disabled', 404))).toBe('disabled');
        expect(platformRefusal(apiError('core.internal', 500))).toBeNull();
        expect(platformRefusal(null)).toBeNull();
        expect(platformRefusal(new Error('boom'))).toBeNull();
    });
});
