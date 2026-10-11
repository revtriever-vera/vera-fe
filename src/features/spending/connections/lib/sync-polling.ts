import type { ConnectionView } from '../../types';

export const POLL_INTERVAL_MS: number = 3000;
export const POLL_WINDOW_MS: number = 120_000;

export function anySyncing(connections: readonly ConnectionView[]): boolean {
    return connections.some((connection: ConnectionView): boolean => connection.syncing);
}

export function shouldPoll(connections: readonly ConnectionView[], startedAt: number, now: number): boolean {
    return anySyncing(connections) && now - startedAt < POLL_WINDOW_MS;
}
