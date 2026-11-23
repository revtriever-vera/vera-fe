import type { FixedIncomeKind, IssuerKind } from '../types';

const COMPANY_KINDS: ReadonlySet<FixedIncomeKind> = new Set<FixedIncomeKind>(['debenture', 'cri', 'cra']);

export function issuerKindFor(kind: FixedIncomeKind): IssuerKind {
    return COMPANY_KINDS.has(kind) ? 'company' : 'bank';
}

export function keepsIssuer(kind: FixedIncomeKind, issuer: { readonly kind: string } | null): boolean {
    return issuer !== null && issuer.kind === issuerKindFor(kind);
}
