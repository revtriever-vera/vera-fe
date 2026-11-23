const DAY_MS: number = 24 * 60 * 60 * 1000;

export function inviteDaysLeft(expiresAt: string, now: number = Date.now()): number {
    return Math.max(1, Math.ceil((new Date(expiresAt).getTime() - now) / DAY_MS));
}
