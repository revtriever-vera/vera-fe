import { useEffect, useRef, type RefObject } from 'react';
import { LINK_STATUS, type LinkStatus } from '../types';

export function useAnnounceLinked(status: LinkStatus | undefined, onLinked: () => void): void {
    const previous: RefObject<LinkStatus | undefined> = useRef<LinkStatus | undefined>(undefined);
    useEffect((): void => {
        const before: LinkStatus | undefined = previous.current;
        previous.current = status;
        if (before !== undefined && before !== LINK_STATUS.active && status === LINK_STATUS.active) {
            onLinked();
        }
    }, [status, onLinked]);
}
