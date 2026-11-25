import type { paths } from '@/shared/lib/api/schema';

type PreviewOperation = paths['/investment-imports/preview']['post'];
type CommitOperation = paths['/investment-imports']['post'];

export type InvestmentPreview = PreviewOperation['responses']['200']['content']['application/json'];
type ApiPreviewLine = InvestmentPreview['operations'][number];

export interface ForeignAmounts {
    readonly fxRate?: string | null;
    readonly grossBrlMinor?: number | null;
    readonly withheldTaxMinor?: number | null;
}

export type PreviewLine = ApiPreviewLine & ForeignAmounts;
export type EffectItem = InvestmentPreview['effect'][number];
export type PositionBalance = NonNullable<EffectItem['before']>;
export type PreviewWarning = InvestmentPreview['warnings'][number];
export type PreviewNote = InvestmentPreview['notes'][number];

export type CommitBody = CommitOperation['requestBody']['content']['application/json'];
export type LineEdit = NonNullable<CommitBody['edits']>[number];
export type InvestmentImportCreated = CommitOperation['responses']['201']['content']['application/json'];

export type InvestmentImportList = paths['/investment-imports']['get']['responses']['200']['content']['application/json'];
export type InvestmentImportView = InvestmentImportList['data'][number];
export type InvestmentImportUndone = paths['/investment-imports/{id}']['delete']['responses']['200']['content']['application/json'];

export type LineStatus = PreviewLine['status'];
export type LineKind = NonNullable<PreviewLine['kind']>;
export type PositionMode = NonNullable<LineEdit['positionMode']>;

export const POSITION_MODES = { add: 'add', historyOnly: 'history_only' } as const satisfies Record<string, PositionMode>;

export const LINE_STATUS = {
    ok: 'ok',
    check: 'check',
    blocked: 'blocked',
    duplicate: 'duplicate',
    ignored: 'ignored'
} as const satisfies Record<string, LineStatus>;

export const LINE_KIND = {
    buy: 'buy',
    sell: 'sell',
    split: 'split',
    reverseSplit: 'reverse_split',
    bonus: 'bonus',
    income: 'income',
    transfer: 'transfer'
} as const satisfies Record<string, LineKind>;

export const LINE_REASON = {
    assetNotFound: 'asset_not_found',
    assetNotAvailable: 'asset_not_available',
    sellExceedsPosition: 'sell_exceeds_position',
    eventFactor: 'event_factor',
    invalidQuantity: 'invalid_quantity',
    unsupportedDirection: 'unsupported_direction',
    positionModeRequired: 'position_mode_required'
} as const;
