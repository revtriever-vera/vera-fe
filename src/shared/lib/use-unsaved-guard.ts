import { useBlocker } from '@tanstack/react-router';

export interface UnsavedGuard {
    readonly blocked: boolean;
    readonly stay: () => void;
    readonly leave: () => void;
}

interface GuardResolver {
    readonly status: string;
    readonly proceed?: () => void;
    readonly reset?: () => void;
}

export function useUnsavedGuard(dirty: boolean): UnsavedGuard {
    const resolver: GuardResolver = useBlocker({
        shouldBlockFn: (): boolean => dirty,
        enableBeforeUnload: dirty,
        withResolver: true
    });
    return {
        blocked: resolver.status === 'blocked',
        stay: (): void => {
            resolver.reset?.();
        },
        leave: (): void => {
            resolver.proceed?.();
        }
    };
}
