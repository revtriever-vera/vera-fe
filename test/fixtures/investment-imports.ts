import type {
    EffectItem,
    InvestmentImportCreated,
    InvestmentImportList,
    InvestmentImportView,
    InvestmentPreview,
    PreviewLine
} from '@/features/portfolio/imports/types';

export const PETR4_ID: string = 'asset-petr4';
export const VALE3_ID: string = 'asset-vale3';

export function previewLine(overrides: Partial<PreviewLine> = {}): PreviewLine {
    return {
        lineId: 'line-1',
        status: 'ok',
        reason: null,
        kind: 'buy',
        incomeKind: null,
        direction: 'credit',
        tradeDate: '2026-03-10',
        ticker: 'PETR4',
        assetId: PETR4_ID,
        quantity: '100',
        unitPrice: '30',
        grossMinor: 300000,
        feesMinor: 0,
        currency: 'BRL',
        positionMode: 'add',
        ...overrides
    };
}

export function effectItem(overrides: Partial<EffectItem> = {}): EffectItem {
    return {
        assetId: PETR4_ID,
        ticker: 'PETR4',
        name: 'Petrobras PN',
        existingPosition: false,
        before: null,
        after: { quantity: '100', averagePrice: '30' },
        ...overrides
    };
}

export function investmentPreview(overrides: Partial<InvestmentPreview> = {}): InvestmentPreview {
    return {
        previewId: 'preview-1',
        source: 'b3',
        documentType: null,
        notes: [],
        operations: [previewLine()],
        effect: [effectItem()],
        fixedIncome: [],
        warnings: [],
        alreadyImportedAt: null,
        expiresAt: '2026-11-25T12:30:00.000Z',
        ...overrides
    };
}

export function importedTitle(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        lineId: 'fi-1',
        product: 'CDB Banco Exemplo',
        issuer: null,
        issuerName: 'Banco Exemplo',
        kind: 'cdb',
        indexer: 'cdi_percent',
        rateBps: 11200,
        appliedMinor: 1000000,
        appliedAt: '2025-08-01',
        maturityDate: '2029-08-01',
        status: 'inferred',
        reason: null,
        ...overrides
    };
}

export function investmentImportCreated(overrides: Partial<InvestmentImportCreated> = {}): InvestmentImportCreated {
    return {
        importId: 'import-1',
        applied: 1,
        skipped: 0,
        positions: [effectItem()],
        ...overrides
    };
}

export function investmentImportView(overrides: Partial<InvestmentImportView> = {}): InvestmentImportView {
    return {
        id: 'import-1',
        source: 'b3',
        fileName: 'negociacao-2026.xlsx',
        status: 'completed',
        operations: 12,
        fixedIncomeTitles: 0,
        createdAt: '2026-11-20T10:00:00.000Z',
        ...overrides
    };
}

export function investmentImportList(items: readonly InvestmentImportView[] = []): InvestmentImportList {
    return {
        data: [...items],
        pagination: { page: 1, pageSize: 5, totalRecords: items.length, totalPages: items.length === 0 ? 0 : 1 }
    };
}
