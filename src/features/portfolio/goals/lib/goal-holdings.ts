import type { GoalHoldingBody, GoalHoldingView, GoalView } from '../types';
import { FULL_SHARE_BPS } from '../types';
import { parsePercentInput } from '../../lib/parse-percent-input';
import type { SupportedLocale } from '@/shared/lib/locale';

export type ShareTexts = Readonly<Record<string, string>>;

export function holdingKey(kind: string, holdingId: string): string {
    return `${kind}:${holdingId}`;
}

export function usedBpsByHolding(goals: readonly GoalView[], excludeGoalId: string | null): ReadonlyMap<string, number> {
    const used: Map<string, number> = new Map<string, number>();
    for (const goal of goals) {
        if (goal.id === excludeGoalId) {
            continue;
        }
        for (const holding of goal.holdings) {
            const key: string = holdingKey(holding.kind, holding.holdingId);
            used.set(key, (used.get(key) ?? 0) + holding.shareBps);
        }
    }
    return used;
}

export function freeBpsOf(used: ReadonlyMap<string, number>, key: string): number {
    return Math.max(0, FULL_SHARE_BPS - (used.get(key) ?? 0));
}

export function sharesFromHoldings(holdings: readonly GoalHoldingView[], format: (bps: number) => string): ShareTexts {
    const texts: Record<string, string> = {};
    for (const holding of holdings) {
        if (!holding.removed) {
            texts[holdingKey(holding.kind, holding.holdingId)] = format(holding.shareBps);
        }
    }
    return texts;
}

export function bodyHoldings(texts: ShareTexts, locale: SupportedLocale): GoalHoldingBody[] {
    const body: GoalHoldingBody[] = [];
    for (const [key, text] of Object.entries(texts)) {
        const bps: number | null = text.trim() === '' ? null : parsePercentInput(text, locale);
        const [kind, holdingId]: string[] = key.split(':');
        if (bps !== null && bps > 0 && (kind === 'position' || kind === 'fixed_income') && holdingId !== undefined) {
            body.push({ kind, holdingId, shareBps: bps });
        }
    }
    return body;
}

export function sameHoldings(left: readonly GoalHoldingBody[], right: readonly GoalHoldingBody[]): boolean {
    const order = (items: readonly GoalHoldingBody[]): string =>
        items
            .map((item: GoalHoldingBody): string => `${holdingKey(item.kind, item.holdingId)}=${String(item.shareBps)}`)
            .sort((left: string, right: string): number => left.localeCompare(right))
            .join('|');
    return order(left) === order(right);
}
