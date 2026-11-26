import type { PayloadKind, SummaryKind, SummaryParams } from '../types';

export const aiKeys: {
    all: readonly ['ai'];
    consent: () => readonly ['ai', 'consent'];
    summaries: () => readonly ['ai', 'summary'];
    summary: (kind: SummaryKind, params: SummaryParams) => readonly ['ai', 'summary', SummaryKind, SummaryParams];
    payload: (kind: PayloadKind, params: SummaryParams) => readonly ['ai', 'payload', PayloadKind, SummaryParams];
} = {
    all: ['ai'] as const,
    consent: (): readonly ['ai', 'consent'] => [...aiKeys.all, 'consent'] as const,
    summaries: (): readonly ['ai', 'summary'] => [...aiKeys.all, 'summary'] as const,
    summary: (kind: SummaryKind, params: SummaryParams): readonly ['ai', 'summary', SummaryKind, SummaryParams] =>
        [...aiKeys.summaries(), kind, params] as const,
    payload: (kind: PayloadKind, params: SummaryParams): readonly ['ai', 'payload', PayloadKind, SummaryParams] =>
        [...aiKeys.all, 'payload', kind, params] as const
};
