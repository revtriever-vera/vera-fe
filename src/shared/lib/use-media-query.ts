import { useSyncExternalStore } from 'react';

function subscribeTo(query: string): (notify: () => void) => () => void {
    return (notify: () => void): (() => void) => {
        if (typeof window.matchMedia !== 'function') {
            return (): void => undefined;
        }
        const list: MediaQueryList = window.matchMedia(query);
        list.addEventListener('change', notify);
        return (): void => {
            list.removeEventListener('change', notify);
        };
    };
}

function matches(query: string): boolean {
    return typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        subscribeTo(query),
        (): boolean => matches(query),
        (): boolean => false
    );
}
