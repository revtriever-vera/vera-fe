import type { LinkView } from '../types';
import { LINK_STATUS } from '../types';

export const LINK_POLL_MS: number = 3000;
export const LINK_POLL_MAX_MS: number = 10 * 60 * 1000;

export interface PollDecision {
    readonly interval: number | false;
    readonly startedAt: number | null;
}

const STOPPED: PollDecision = { interval: false, startedAt: null };

export function decidePolling(view: LinkView | undefined, startedAt: number | null, now: number): PollDecision {
    if (view?.status !== LINK_STATUS.pending) {
        return STOPPED;
    }
    const began: number = startedAt ?? now;
    const expired: boolean = view.pending !== null && new Date(view.pending.expiresAt).getTime() <= now;
    if (expired || now - began >= LINK_POLL_MAX_MS) {
        return { interval: false, startedAt: began };
    }
    return { interval: LINK_POLL_MS, startedAt: began };
}
