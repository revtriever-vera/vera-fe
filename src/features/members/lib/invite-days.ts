const DAY_MS: number = 24 * 60 * 60 * 1000;

export function inviteExpired(expiresAt: string, now: number = Date.now()): boolean {
    return new Date(expiresAt).getTime() <= now;
}

export function inviteDaysLeft(expiresAt: string, now: number = Date.now()): number {
    return Math.max(1, Math.ceil((new Date(expiresAt).getTime() - now) / DAY_MS));
}
