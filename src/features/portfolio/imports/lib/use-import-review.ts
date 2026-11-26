import { useMemo, useState } from 'react';
import { readImportedTitles, type ImportedTitle } from '../schemas/imported-title.schema';
import type { InvestmentPreview, LineEdit, PositionMode, PreviewLine } from '../types';
import { readinessOf, type Readiness } from './import-readiness';
import { patchDraft, toEdits, type Drafts, type LineDraft, type PositionModes } from './line-drafts';
import { buildEffectRows, type EffectRow } from './recalculate-effect';
import { pendingTitles, toDecisions, type TitleChoice, type TitleChoices } from './title-choices';

export interface Editing {
    readonly drafts: Drafts;
    readonly modes: PositionModes;
    readonly choices: TitleChoices;
    readonly editLine: (lineId: string, patch: Partial<LineDraft>) => void;
    readonly chooseMode: (assetId: string, mode: PositionMode) => void;
    readonly chooseTitle: (lineId: string, choice: TitleChoice | null) => void;
    readonly reset: () => void;
}

export function useEditing(): Editing {
    const [drafts, setDrafts] = useState<Drafts>({});
    const [modes, setModes] = useState<PositionModes>({});
    const [choices, setChoices] = useState<TitleChoices>({});
    return {
        drafts,
        modes,
        choices,
        editLine: (lineId: string, patch: Partial<LineDraft>): void => {
            setDrafts((current: Drafts): Drafts => patchDraft(current, lineId, patch));
        },
        chooseMode: (assetId: string, mode: PositionMode): void => {
            setModes((current: PositionModes): PositionModes => ({ ...current, [assetId]: mode }));
        },
        chooseTitle: (lineId: string, choice: TitleChoice | null): void => {
            setChoices((current: TitleChoices): TitleChoices => {
                const { [lineId]: _removed, ...rest } = current;
                return choice === null ? rest : { ...rest, [lineId]: choice };
            });
        },
        reset: (): void => {
            setDrafts({});
            setModes({});
            setChoices({});
        }
    };
}

const NO_LINES: readonly PreviewLine[] = [];

export interface Derived {
    readonly lines: readonly PreviewLine[];
    readonly titles: readonly ImportedTitle[];
    readonly rows: readonly EffectRow[];
}

export function useDerived(preview: InvestmentPreview | null, editing: Editing): Derived {
    const lines: readonly PreviewLine[] = preview?.operations ?? NO_LINES;
    const titles: readonly ImportedTitle[] = useMemo((): ImportedTitle[] => readImportedTitles(preview?.fixedIncome ?? []), [preview]);
    const rows: readonly EffectRow[] = useMemo(
        (): EffectRow[] => buildEffectRows(preview?.effect ?? [], lines, editing.drafts, editing.modes),
        [preview, lines, editing.drafts, editing.modes]
    );
    return { lines, titles, rows };
}

export function canConfirmOf(preview: InvestmentPreview | null, readiness: Readiness, pending: number, titles: number): boolean {
    const clear: boolean = readiness.blocked === 0 && readiness.invalid === 0 && readiness.pendingAssets.length === 0 && pending === 0;
    return preview !== null && clear && readiness.active + titles > 0;
}

export interface ReviewState extends Editing, Derived {
    readonly holder: string;
    readonly readiness: Readiness;
    readonly pendingTitles: number;
    readonly canConfirm: boolean;
}

export function useReviewState(preview: InvestmentPreview | null, holder: string, editing: Editing): ReviewState {
    const derived: Derived = useDerived(preview, editing);
    const readiness: Readiness = readinessOf(derived.lines, derived.rows, editing.drafts, editing.modes);
    const pending: number = pendingTitles(derived.titles, editing.choices).length;
    return {
        ...editing,
        ...derived,
        holder,
        readiness,
        pendingTitles: pending,
        canConfirm: canConfirmOf(preview, readiness, pending, derived.titles.length)
    };
}

export interface ReviewCorrections {
    readonly edits: readonly LineEdit[];
    readonly fixedIncome: ReturnType<typeof toDecisions>;
}

export function correctionsOf(preview: InvestmentPreview, review: ReviewState): ReviewCorrections {
    return { edits: toEdits(preview.operations, review.drafts, review.modes), fixedIncome: toDecisions(review.titles, review.choices) };
}
