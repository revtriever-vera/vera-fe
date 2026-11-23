import { isoOf } from '@/shared/lib/calendar-grid';
import { NO_CARD_MAX_VALIDITY_DAYS } from './signup-link-offer';

const MINUTE_MS: number = 60_000;
const DAY_MS: number = 86_400_000;

export function todayIso(now: Date = new Date()): string {
    return isoOf(now.getFullYear(), now.getMonth(), now.getDate());
}

export function noCardLastIso(now: Date = new Date()): string {
    return isoOf(now.getFullYear(), now.getMonth(), now.getDate() + NO_CARD_MAX_VALIDITY_DAYS);
}

/** O último instante do dia escolhido; sem cartão nunca passa do horizonte de 90 dias que a API aceita. */
export function expiryInstant(iso: string, noCard: boolean, now: Date = new Date()): string {
    const endOfDay: number = new Date(`${iso}T23:59:59`).getTime();
    const horizon: number = now.getTime() + NO_CARD_MAX_VALIDITY_DAYS * DAY_MS - MINUTE_MS;
    return new Date(noCard ? Math.min(endOfDay, horizon) : endOfDay).toISOString();
}
