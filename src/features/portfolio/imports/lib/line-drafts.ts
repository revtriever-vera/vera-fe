import { LINE_KIND, LINE_REASON, LINE_STATUS, type LineEdit, type LineKind, type PositionMode, type PreviewLine } from '../types';

export interface PickedAsset {
    readonly id: string;
    readonly ticker: string;
    readonly name: string;
}

export interface LineDraft {
    readonly quantity?: string;
    readonly unitPrice?: string;
    readonly tradeDate?: string;
    readonly feesMinor?: number;
    readonly asset?: PickedAsset;
    readonly skip?: boolean;
}

export type Drafts = Readonly<Record<string, LineDraft>>;
export type PositionModes = Readonly<Record<string, PositionMode>>;

const DECIMAL_PATTERN: RegExp = /^\d+(\.\d+)?$/;

export const POSITION_KINDS: ReadonlySet<LineKind> = new Set<LineKind>([
    LINE_KIND.buy,
    LINE_KIND.sell,
    LINE_KIND.split,
    LINE_KIND.reverseSplit,
    LINE_KIND.bonus
]);

const QUANTITY_REASONS: ReadonlySet<string> = new Set<string>([
    LINE_REASON.invalidQuantity,
    LINE_REASON.eventFactor,
    LINE_REASON.sellExceedsPosition
]);

const ASSET_REASONS: ReadonlySet<string> = new Set<string>([LINE_REASON.assetNotFound, LINE_REASON.assetNotAvailable]);

export function parseDecimal(raw: string): string | null {
    const normalized: string = raw.trim().replace(',', '.');
    return DECIMAL_PATTERN.test(normalized) ? normalized : null;
}

function isPositive(raw: string | undefined): boolean {
    const parsed: string | null = raw === undefined ? null : parseDecimal(raw);
    return parsed !== null && Number(parsed) > 0;
}

export function patchDraft(drafts: Drafts, lineId: string, patch: Partial<LineDraft>): Drafts {
    return { ...drafts, [lineId]: { ...drafts[lineId], ...patch } };
}

export function draftFieldInvalid(draft: LineDraft | undefined, field: 'quantity' | 'unitPrice'): boolean {
    const raw: string | undefined = draft?.[field];
    return raw !== undefined && parseDecimal(raw) === null;
}

export function lineInvalid(draft: LineDraft | undefined): boolean {
    return draftFieldInvalid(draft, 'quantity') || draftFieldInvalid(draft, 'unitPrice');
}

export function assetIdOf(line: PreviewLine, draft: LineDraft | undefined): string | null {
    return draft?.asset?.id ?? line.assetId;
}

export function tickerOf(line: PreviewLine, draft: LineDraft | undefined): string | null {
    return draft?.asset?.ticker ?? line.ticker;
}

function valueOf(raw: string | undefined, fallback: string | null): string | null {
    const parsed: string | null = raw === undefined ? null : parseDecimal(raw);
    return parsed ?? fallback;
}

export function effectiveLine(line: PreviewLine, draft: LineDraft | undefined): PreviewLine {
    return {
        ...line,
        assetId: assetIdOf(line, draft),
        ticker: tickerOf(line, draft),
        quantity: valueOf(draft?.quantity, line.quantity),
        unitPrice: valueOf(draft?.unitPrice, line.unitPrice),
        tradeDate: draft?.tradeDate ?? line.tradeDate,
        feesMinor: draft?.feesMinor ?? line.feesMinor
    };
}

export function lineBlocked(line: PreviewLine, draft: LineDraft | undefined): boolean {
    if (line.status !== LINE_STATUS.blocked || draft?.skip === true) {
        return false;
    }
    const reason: string = line.reason ?? '';
    if (ASSET_REASONS.has(reason)) {
        return draft?.asset === undefined;
    }
    if (QUANTITY_REASONS.has(reason)) {
        return !isPositive(draft?.quantity);
    }
    return true;
}

export function lineActive(line: PreviewLine, draft: LineDraft | undefined): boolean {
    const importable: boolean = line.status === LINE_STATUS.ok || line.status === LINE_STATUS.check || line.status === LINE_STATUS.blocked;
    return importable && draft?.skip !== true;
}

export function affectsPosition(line: PreviewLine): boolean {
    return line.kind !== null && POSITION_KINDS.has(line.kind);
}

function modeFor(line: PreviewLine, draft: LineDraft | undefined, modes: PositionModes): PositionMode | undefined {
    const assetId: string | null = assetIdOf(line, draft);
    return assetId === null ? undefined : modes[assetId];
}

function fieldEdits(draft: LineDraft | undefined): Partial<LineEdit> {
    const quantity: string | null = valueOf(draft?.quantity, null);
    const unitPrice: string | null = valueOf(draft?.unitPrice, null);
    return {
        ...(quantity === null ? {} : { quantity }),
        ...(unitPrice === null ? {} : { unitPrice }),
        ...(draft?.tradeDate === undefined ? {} : { tradeDate: draft.tradeDate }),
        ...(draft?.feesMinor === undefined ? {} : { feesMinor: draft.feesMinor })
    };
}

function editOf(line: PreviewLine, draft: LineDraft | undefined, modes: PositionModes): LineEdit | null {
    const positionMode: PositionMode | undefined = affectsPosition(line) ? modeFor(line, draft, modes) : undefined;
    if (draft === undefined && positionMode === undefined) {
        return null;
    }
    return {
        lineId: line.lineId,
        ...(draft?.asset === undefined ? {} : { assetId: draft.asset.id }),
        ...fieldEdits(draft),
        ...(draft?.skip === true ? { skip: true } : {}),
        ...(positionMode === undefined ? {} : { positionMode })
    };
}

export function toEdits(lines: readonly PreviewLine[], drafts: Drafts, modes: PositionModes): LineEdit[] {
    return lines.flatMap((line: PreviewLine): LineEdit[] => {
        const edit: LineEdit | null = editOf(line, drafts[line.lineId], modes);
        return edit === null ? [] : [edit];
    });
}
