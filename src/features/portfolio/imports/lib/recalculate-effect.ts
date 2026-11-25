import { POSITION_MODES, LINE_KIND, type EffectItem, type PositionBalance, type PositionMode, type PreviewLine } from '../types';
import {
    affectsPosition,
    assetIdOf,
    effectiveLine,
    lineActive,
    tickerOf,
    type Drafts,
    type LineDraft,
    type PositionModes
} from './line-drafts';

export interface EffectRow extends EffectItem {
    readonly currency: string;
    readonly recalculated: boolean;
    readonly needsMode: boolean;
}

interface Holding {
    readonly quantity: number;
    readonly average: number | null;
}

const DEFAULT_CURRENCY: string = 'BRL';
const SCALE: number = 8;
const NEGLIGIBLE: number = 1e-9;

function plain(value: number): string {
    return String(Number(value.toFixed(SCALE)));
}

function exponentOf(currency: string): number {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

function holdingOf(balance: PositionBalance | null): Holding | null {
    if (balance === null) {
        return null;
    }
    return { quantity: Number(balance.quantity), average: balance.averagePrice === null ? null : Number(balance.averagePrice) };
}

function balanceOf(holding: Holding | null): PositionBalance | null {
    if (holding === null || holding.quantity < NEGLIGIBLE) {
        return null;
    }
    return { quantity: plain(holding.quantity), averagePrice: holding.average === null ? null : plain(holding.average) };
}

function pricedPart(holding: Holding | null): { quantity: number; cost: number } {
    const average: number | null | undefined = holding?.average;
    if (holding === null || average === null || average === undefined) {
        return { quantity: 0, cost: 0 };
    }
    return { quantity: holding.quantity, cost: holding.quantity * average };
}

function feesOf(line: PreviewLine): number {
    return (line.feesMinor ?? 0) / 10 ** exponentOf(line.currency ?? DEFAULT_CURRENCY);
}

function buy(holding: Holding | null, line: PreviewLine): Holding | null {
    const bought: number = Number(line.quantity ?? 0);
    if (bought === 0) {
        return holding;
    }
    const priced: { quantity: number; cost: number } = pricedPart(holding);
    const cost: number = bought * Number(line.unitPrice ?? 0) + feesOf(line);
    return { quantity: (holding?.quantity ?? 0) + bought, average: (priced.cost + cost) / (priced.quantity + bought) };
}

function sell(holding: Holding | null, line: PreviewLine): Holding | null {
    const sold: number = Number(line.quantity ?? 0);
    return holding === null ? null : { quantity: Math.max(holding.quantity - sold, 0), average: holding.average };
}

function scale(holding: Holding | null, factor: number, inverse: boolean): Holding | null {
    if (holding === null || factor === 0) {
        return holding;
    }
    const ratio: number = inverse ? 1 / factor : factor;
    return { quantity: holding.quantity * ratio, average: holding.average === null ? null : holding.average / ratio };
}

function bonus(holding: Holding | null, line: PreviewLine): Holding | null {
    if (holding === null) {
        return holding;
    }
    const quantity: number = holding.quantity + Number(line.quantity ?? 0);
    return { quantity, average: holding.average === null ? null : (holding.quantity * holding.average) / quantity };
}

function step(holding: Holding | null, line: PreviewLine): Holding | null {
    const factor: number = Number(line.quantity ?? 0);
    const steps: Readonly<Record<string, () => Holding | null>> = {
        [LINE_KIND.buy]: (): Holding | null => buy(holding, line),
        [LINE_KIND.sell]: (): Holding | null => sell(holding, line),
        [LINE_KIND.split]: (): Holding | null => scale(holding, factor, false),
        [LINE_KIND.reverseSplit]: (): Holding | null => scale(holding, factor, true),
        [LINE_KIND.bonus]: (): Holding | null => bonus(holding, line)
    };
    return steps[line.kind ?? '']?.() ?? holding;
}

function modeOf(line: PreviewLine, modes: PositionModes): PositionMode {
    const chosen: PositionMode | undefined = line.assetId === null ? undefined : modes[line.assetId];
    return chosen ?? line.positionMode ?? POSITION_MODES.add;
}

function byDate(left: PreviewLine, right: PreviewLine): number {
    return (left.tradeDate ?? '').localeCompare(right.tradeDate ?? '');
}

interface AssetLines {
    readonly lines: readonly PreviewLine[];
    readonly touched: boolean;
}

function linesOfAsset(assetId: string, source: readonly PreviewLine[], drafts: Drafts): AssetLines {
    const mine: PreviewLine[] = [];
    let touched: boolean = false;
    for (const line of source) {
        const draft: LineDraft | undefined = drafts[line.lineId];
        const current: boolean = assetIdOf(line, draft) === assetId;
        if (!affectsPosition(line) || !(current || line.assetId === assetId)) {
            continue;
        }
        touched = touched || draft !== undefined;
        if (current && lineActive(line, draft)) {
            mine.push(effectiveLine(line, draft));
        }
    }
    return { lines: mine, touched };
}

function recalculated(item: EffectItem, group: AssetLines, modes: PositionModes): EffectItem['after'] {
    const added: PreviewLine[] = group.lines.filter((line: PreviewLine): boolean => modeOf(line, modes) === POSITION_MODES.add);
    const result: Holding | null = [...added]
        .sort(byDate)
        .reduce((holding: Holding | null, line: PreviewLine): Holding | null => step(holding, line), holdingOf(item.before));
    return balanceOf(result);
}

function currencyOf(group: AssetLines): string {
    return group.lines.find((line: PreviewLine): boolean => line.currency !== null)?.currency ?? DEFAULT_CURRENCY;
}

function rowOf(item: EffectItem, source: readonly PreviewLine[], drafts: Drafts, modes: PositionModes): EffectRow {
    const group: AssetLines = linesOfAsset(item.assetId, source, drafts);
    const changed: boolean = group.touched || modes[item.assetId] !== undefined;
    return {
        ...item,
        after: changed ? recalculated(item, group, modes) : item.after,
        currency: currencyOf(group),
        recalculated: changed,
        needsMode: group.lines.length > 0
    };
}

function pickedItem(line: PreviewLine, draft: LineDraft): EffectItem | null {
    if (draft.asset === undefined) {
        return null;
    }
    return {
        assetId: draft.asset.id,
        ticker: tickerOf(line, draft) ?? '',
        name: draft.asset.name,
        existingPosition: false,
        before: null,
        after: null
    };
}

function addedRows(known: ReadonlySet<string>, source: readonly PreviewLine[], drafts: Drafts, modes: PositionModes): EffectRow[] {
    const rows: Map<string, EffectRow> = new Map();
    for (const line of source) {
        const draft: LineDraft | undefined = drafts[line.lineId];
        const item: EffectItem | null = draft === undefined || !lineActive(line, draft) ? null : pickedItem(line, draft);
        if (item !== null && !known.has(item.assetId) && !rows.has(item.assetId)) {
            rows.set(item.assetId, rowOf(item, source, drafts, modes));
        }
    }
    return [...rows.values()];
}

export function buildEffectRows(
    effect: readonly EffectItem[],
    source: readonly PreviewLine[],
    drafts: Drafts,
    modes: PositionModes
): EffectRow[] {
    const known: ReadonlySet<string> = new Set(effect.map((item: EffectItem): string => item.assetId));
    return [...effect.map((item: EffectItem): EffectRow => rowOf(item, source, drafts, modes)), ...addedRows(known, source, drafts, modes)];
}
