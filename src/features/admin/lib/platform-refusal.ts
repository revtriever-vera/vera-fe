import { ApiError } from '@/shared/lib/api/api-error';

export type PlatformRefusal = 'denied' | 'disabled';

export function platformRefusal(error: Error | null): PlatformRefusal | null {
    if (!(error instanceof ApiError)) {
        return null;
    }
    if (error.problem.type === 'identity.platform_disabled') {
        return 'disabled';
    }
    return error.problem.type === 'identity.platform_only' ? 'denied' : null;
}
