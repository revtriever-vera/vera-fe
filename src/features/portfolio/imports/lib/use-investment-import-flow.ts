import { useMemo, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { ApiError } from '@/shared/lib/api/api-error';
import { HOLDER_ALL } from '../../lib/holder-filter';
import { useCommitInvestmentImport, type CommitInvestmentImportInput } from '../api/use-commit-investment-import.mutation';
import { usePreviewInvestmentImport } from '../api/use-preview-investment-import.mutation';
import { readImportedTitles, type ImportedTitle } from '../schemas/imported-title.schema';
import type { InvestmentImportCreated, InvestmentPreview, PositionMode, PreviewLine } from '../types';
import type { PreviewFormInput } from './build-preview-form-data';
import { investmentImportErrorMessage } from './investment-import-error-message';
import { readinessOf, type Readiness } from './import-readiness';
import { patchDraft, toEdits, type Drafts, type LineDraft, type PositionModes } from './line-drafts';
import { buildEffectRows, type EffectRow } from './recalculate-effect';
import { importedCount, pendingTitles, toDecisions, type TitleChoice, type TitleChoices } from './title-choices';

export interface ImportOutcome {
    readonly created: InvestmentImportCreated;
    readonly titles: number;
    readonly currencies: Readonly<Record<string, string>>;
}

export interface InvestmentImportFlow {
    readonly file: File | null;
    readonly holder: string;
    readonly preview: InvestmentPreview | null;
    readonly previewing: boolean;
    readonly committing: boolean;
    readonly errorMessage: string | null;
    readonly lines: readonly PreviewLine[];
    readonly rows: readonly EffectRow[];
    readonly titles: readonly ImportedTitle[];
    readonly drafts: Drafts;
    readonly modes: PositionModes;
    readonly choices: TitleChoices;
    readonly readiness: Readiness;
    readonly pendingTitles: number;
    readonly canConfirm: boolean;
    readonly outcome: ImportOutcome | null;
    readonly pickFile: (file: File) => void;
    readonly clearFile: () => void;
    readonly changeHolder: (holder: string) => void;
    readonly editLine: (lineId: string, patch: Partial<LineDraft>) => void;
    readonly chooseMode: (assetId: string, mode: PositionMode) => void;
    readonly chooseTitle: (lineId: string, choice: TitleChoice | null) => void;
    readonly commit: () => void;
    readonly restart: () => void;
}

interface Failure {
    readonly errorMessage: string | null;
    readonly clear: () => void;
    readonly report: (error: Error, title: string) => void;
}

function useFailure(): Failure {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const toast: ToastApi = useToast();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    return {
        errorMessage,
        clear: (): void => {
            setErrorMessage(null);
        },
        report: (error: Error, title: string): void => {
            const message: string = investmentImportErrorMessage(t, error);
            if (error instanceof ApiError) {
                setErrorMessage(message);
                return;
            }
            toast.show({ tone: 'critical', title, detail: message });
        }
    };
}

interface Editing {
    readonly drafts: Drafts;
    readonly modes: PositionModes;
    readonly choices: TitleChoices;
    readonly editLine: (lineId: string, patch: Partial<LineDraft>) => void;
    readonly chooseMode: (assetId: string, mode: PositionMode) => void;
    readonly chooseTitle: (lineId: string, choice: TitleChoice | null) => void;
    readonly reset: () => void;
}

function useEditing(): Editing {
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

interface PreviewStep {
    readonly file: File | null;
    readonly holder: string;
    readonly preview: InvestmentPreview | null;
    readonly previewing: boolean;
    readonly pickFile: (file: File) => void;
    readonly clearFile: () => void;
    readonly changeHolder: (holder: string) => void;
}

interface Runner {
    readonly previewing: boolean;
    readonly run: (file: File, holder: string) => void;
    readonly reset: () => void;
}

function usePreviewRunner(failure: Failure, editing: Editing, setPreview: (preview: InvestmentPreview | null) => void): Runner {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const mutation: UseMutationResult<InvestmentPreview, ApiError, PreviewFormInput> = usePreviewInvestmentImport();
    return {
        previewing: mutation.isPending,
        run: (file: File, holder: string): void => {
            failure.clear();
            editing.reset();
            setPreview(null);
            mutation.mutate(
                { file, holderUserId: holder === HOLDER_ALL ? undefined : holder },
                {
                    onSuccess: setPreview,
                    onError: (error: Error): void => {
                        failure.report(error, t('toasts.previewFailed'));
                    }
                }
            );
        },
        reset: mutation.reset
    };
}

function usePreviewStep(failure: Failure, editing: Editing): PreviewStep {
    const [file, setFile] = useState<File | null>(null);
    const [holder, setHolder] = useState<string>(HOLDER_ALL);
    const [preview, setPreview] = useState<InvestmentPreview | null>(null);
    const runner: Runner = usePreviewRunner(failure, editing, setPreview);
    return {
        file,
        holder,
        preview,
        previewing: runner.previewing,
        pickFile: (picked: File): void => {
            setFile(picked);
            runner.run(picked, holder);
        },
        clearFile: (): void => {
            runner.reset();
            setFile(null);
            setPreview(null);
            editing.reset();
            failure.clear();
        },
        changeHolder: (next: string): void => {
            setHolder(next);
            if (file !== null) {
                runner.run(file, next);
            }
        }
    };
}

interface CommitStep {
    readonly outcome: ImportOutcome | null;
    readonly committing: boolean;
    readonly commit: () => void;
    readonly dismiss: () => void;
}

interface CommitSource {
    readonly preview: InvestmentPreview | null;
    readonly editing: Editing;
    readonly titles: readonly ImportedTitle[];
    readonly rows: readonly EffectRow[];
}

function outcomeOf(created: InvestmentImportCreated, { editing, titles, rows }: CommitSource): ImportOutcome {
    return {
        created,
        titles: importedCount(titles, editing.choices),
        currencies: Object.fromEntries(rows.map((row: EffectRow): [string, string] => [row.assetId, row.currency]))
    };
}

function inputOf(preview: InvestmentPreview, { editing, titles }: CommitSource): CommitInvestmentImportInput {
    return {
        previewId: preview.previewId,
        edits: toEdits(preview.operations, editing.drafts, editing.modes),
        fixedIncome: toDecisions(titles, editing.choices)
    };
}

function useCommitStep(failure: Failure, source: CommitSource): CommitStep {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const mutation: UseMutationResult<InvestmentImportCreated, ApiError, CommitInvestmentImportInput> = useCommitInvestmentImport();
    const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
    const commit = (): void => {
        if (source.preview === null) {
            return;
        }
        failure.clear();
        mutation.mutate(inputOf(source.preview, source), {
            onSuccess: (created: InvestmentImportCreated): void => {
                setOutcome(outcomeOf(created, source));
            },
            onError: (error: Error): void => {
                failure.report(error, t('toasts.importFailed'));
            }
        });
    };
    return {
        outcome,
        committing: mutation.isPending,
        commit,
        dismiss: (): void => {
            setOutcome(null);
        }
    };
}

const NO_LINES: readonly PreviewLine[] = [];

interface Derived {
    readonly lines: readonly PreviewLine[];
    readonly titles: readonly ImportedTitle[];
    readonly rows: readonly EffectRow[];
}

function useDerived(preview: InvestmentPreview | null, editing: Editing): Derived {
    const lines: readonly PreviewLine[] = preview?.operations ?? NO_LINES;
    const titles: readonly ImportedTitle[] = useMemo((): ImportedTitle[] => readImportedTitles(preview?.fixedIncome ?? []), [preview]);
    const rows: readonly EffectRow[] = useMemo(
        (): EffectRow[] => buildEffectRows(preview?.effect ?? [], lines, editing.drafts, editing.modes),
        [preview, lines, editing.drafts, editing.modes]
    );
    return { lines, titles, rows };
}

function canConfirmOf(preview: InvestmentPreview | null, readiness: Readiness, pending: number, titles: number): boolean {
    const clear: boolean = readiness.blocked === 0 && readiness.invalid === 0 && readiness.pendingAssets.length === 0 && pending === 0;
    return preview !== null && clear && readiness.active + titles > 0;
}

export function useInvestmentImportFlow(): InvestmentImportFlow {
    const failure: Failure = useFailure();
    const editing: Editing = useEditing();
    const step: PreviewStep = usePreviewStep(failure, editing);
    const derived: Derived = useDerived(step.preview, editing);
    const readiness: Readiness = readinessOf(derived.lines, derived.rows, editing.drafts, editing.modes);
    const pending: number = pendingTitles(derived.titles, editing.choices).length;
    const committed: CommitStep = useCommitStep(failure, { preview: step.preview, editing, titles: derived.titles, rows: derived.rows });
    return {
        ...step,
        ...editing,
        ...derived,
        errorMessage: failure.errorMessage,
        readiness,
        pendingTitles: pending,
        canConfirm: canConfirmOf(step.preview, readiness, pending, derived.titles.length),
        outcome: committed.outcome,
        committing: committed.committing,
        commit: committed.commit,
        restart: (): void => {
            step.clearFile();
            committed.dismiss();
        }
    };
}
