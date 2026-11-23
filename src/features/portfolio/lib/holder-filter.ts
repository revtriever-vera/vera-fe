import { track } from '@/shared/lib/analytics';
import { HOLDER_KINDS, type HolderKind } from '../types';

export const HOLDER_ALL: string = 'all';

export type HolderParam = string | undefined;

export interface PortfolioPerson {
    readonly userId: string;
    readonly name: string;
}

export function holderKind(holder: HolderParam): HolderKind {
    if (holder === undefined) {
        return HOLDER_KINDS.any;
    }
    return holder === HOLDER_ALL ? HOLDER_KINDS.all : HOLDER_KINDS.person;
}

export function holderQuery(holder: HolderParam): { holder?: string } {
    return holder === undefined ? {} : { holder };
}

export function holderBody(holder: string, multi: boolean): { holderUserId?: string | null } {
    if (!multi) {
        return {};
    }
    return { holderUserId: holder === HOLDER_ALL ? null : holder };
}

export function holderValueOf(holderUserId: string | null | undefined): string {
    return holderUserId ?? HOLDER_ALL;
}

export function personName(people: readonly PortfolioPerson[], userId: string): string {
    return people.find((person: PortfolioPerson): boolean => person.userId === userId)?.name ?? '';
}

export function trackHolder(holder: string, multi: boolean, source: 'add' | 'edit'): void {
    if (multi) {
        track('holder_set', { kind: holder === HOLDER_ALL ? 'all' : 'person', source });
    }
}
