import type { ChangeItem, ChangesResponse } from '@/features/portfolio/changes/types';

export function changeItem(overrides: Partial<ChangeItem> = {}): ChangeItem {
    return {
        id: '00000000-0000-4000-8000-0000000000c1',
        assetId: '00000000-0000-4000-8000-0000000000c2',
        symbol: 'XPLG11',
        source: 'b3_fnet',
        category: 'relevant_fact',
        title: 'Fato relevante: nova emissão de cotas',
        kind: 'relevant_fact',
        date: '2026-11-24',
        summary: 'O fundo anunciou uma nova emissão de cotas para comprar dois galpões.',
        summaryAvailable: true,
        relevance: 3,
        weightBps: 800,
        weightLine: 'XPLG11 é 8% da sua carteira.',
        documentUrl: 'https://fnet.bmfbovespa.com.br/fnet/publico/exibirDocumento?id=200',
        ...overrides
    };
}

export function sampleChanges(items: readonly ChangeItem[] = [changeItem()]): ChangesResponse {
    return { days: 7, notice: 'Isto não é uma recomendação de compra ou venda.', items: [...items] };
}
