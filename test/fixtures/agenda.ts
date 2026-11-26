import type { AgendaItem, AgendaResponse } from '@/features/portfolio/agenda/types';

export function agendaItem(overrides: Partial<AgendaItem> = {}): AgendaItem {
    return {
        id: '00000000-0000-4000-8000-0000000000d1',
        kind: 'fii_income',
        assetId: '00000000-0000-4000-8000-0000000000d2',
        holdingId: null,
        name: 'XPLG11',
        date: '2026-12-01',
        exDate: '2026-12-01',
        paymentDate: '2026-12-14',
        eventDate: null,
        amountPerUnit: '0.78',
        currency: 'BRL',
        amountForAccountMinor: 7800,
        estimated: true,
        documentUrl: 'https://fnet.bmfbovespa.com.br/fnet/publico/exibirDocumento?id=100',
        ...overrides
    };
}

export function maturityItem(overrides: Partial<AgendaItem> = {}): AgendaItem {
    return agendaItem({
        id: '00000000-0000-4000-8000-0000000000d3',
        kind: 'fixed_income_maturity',
        assetId: null,
        holdingId: '00000000-0000-4000-8000-0000000000d3',
        name: 'CDB Banco X 110% CDI',
        date: '2026-12-10',
        exDate: null,
        paymentDate: null,
        eventDate: '2026-12-10',
        amountPerUnit: null,
        amountForAccountMinor: 10_850_000,
        documentUrl: null,
        ...overrides
    });
}

export function emptyAgenda(): AgendaResponse {
    return { from: '2026-11-25', to: '2026-12-25', items: [] };
}

export function sampleAgenda(): AgendaResponse {
    return {
        from: '2026-11-25',
        to: '2026-12-25',
        items: [
            agendaItem(),
            agendaItem({
                id: '00000000-0000-4000-8000-0000000000d4',
                kind: 'assembly',
                name: 'PETR4',
                date: '2026-12-03',
                exDate: null,
                paymentDate: null,
                eventDate: '2026-12-03',
                amountPerUnit: null,
                amountForAccountMinor: null,
                estimated: false
            }),
            maturityItem()
        ]
    };
}
