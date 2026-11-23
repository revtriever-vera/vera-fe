import type { ConsentState, SummaryKind, SummaryView } from '@/features/summaries/types';

export function consentState(overrides: Partial<ConsentState> = {}): ConsentState {
    return {
        available: true,
        granted: false,
        needsConsent: true,
        noticeVersion: 1,
        acceptedNoticeVersion: null,
        grantedAt: null,
        source: null,
        canChange: true,
        ...overrides
    };
}

export function grantedConsent(overrides: Partial<ConsentState> = {}): ConsentState {
    return consentState({
        granted: true,
        needsConsent: false,
        acceptedNoticeVersion: 1,
        grantedAt: '2026-11-20T12:00:00.000Z',
        source: 'summary_card',
        ...overrides
    });
}

export function summaryView(overrides: Partial<SummaryView> = {}): SummaryView {
    return {
        kind: 'month',
        period: '2026-09',
        paragraphs: ['Você gastou **R$ 8.420** em setembro, 6% a mais que em agosto.', 'Faltam **R$ 1.640** por mês para a meta.'],
        generatedAt: new Date().toISOString(),
        cached: true,
        stale: false,
        source: 'model',
        usage: { state: 'ok', usedBps: 3400, resetsAt: '2026-12-01T03:00:00.000Z' },
        ...overrides
    };
}

export function payloadBody(kind: SummaryKind = 'month'): Record<string, unknown> {
    return { kind, noticeVersion: 1, payload: { mes: '2026-09', gastos: 'R$ 8.420,00' } };
}
