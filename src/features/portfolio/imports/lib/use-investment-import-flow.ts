import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { ApiError } from '@/shared/lib/api/api-error';
import { HOLDER_ALL } from '../../lib/holder-filter';
import { useCommitInvestmentImport, type CommitInvestmentImportInput } from '../api/use-commit-investment-import.mutation';
import { usePreviewInvestmentImport } from '../api/use-preview-investment-import.mutation';
import { MODEL_CONSENT_REQUIRED } from '@/shared/lib/investment-import-files';
import type { ImportedTitle } from '../schemas/imported-title.schema';
import type { InvestmentImportCreated, InvestmentPreview, PositionMode, PreviewLine } from '../types';
import type { PreviewFormInput } from './build-preview-form-data';
import { investmentImportErrorMessage } from './investment-import-error-message';
import type { Readiness } from './import-readiness';
import { toEdits, type Drafts, type LineDraft, type PositionModes } from './line-drafts';
import type { EffectRow } from './recalculate-effect';
import { useEditing, useReviewState, type Derived, type Editing, type ReviewState } from './use-import-review';
import { importedCount, toDecisions, type TitleChoice, type TitleChoices } from './title-choices';

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
    readonly askingConsent: boolean;
    readonly pickFile: (file: File) => void;
    readonly clearFile: () => void;
    readonly changeHolder: (holder: string) => void;
    readonly sendToModel: () => void;
    readonly declineModel: () => void;
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

interface PreviewStep {
    readonly askingConsent: boolean;
    readonly sendToModel: () => void;
    readonly declineModel: () => void;
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
    readonly run: (file: File, holder: string, modelConsent?: boolean) => void;
    readonly reset: () => void;
}

function needsConsent(error: Error): boolean {
    return error instanceof ApiError && error.problem.type === MODEL_CONSENT_REQUIRED;
}

function usePreviewRunner(
    failure: Failure,
    editing: Editing,
    setPreview: (preview: InvestmentPreview | null) => void,
    askConsent: () => void
): Runner {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const mutation: UseMutationResult<InvestmentPreview, ApiError, PreviewFormInput> = usePreviewInvestmentImport();
    return {
        previewing: mutation.isPending,
        run: (file: File, holder: string, modelConsent: boolean = false): void => {
            failure.clear();
            editing.reset();
            setPreview(null);
            mutation.mutate(
                { file, holderUserId: holder === HOLDER_ALL ? undefined : holder, modelConsent },
                {
                    onSuccess: setPreview,
                    onError: (error: Error): void => {
                        if (needsConsent(error)) {
                            askConsent();
                            return;
                        }
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
    const [askingConsent, setAskingConsent] = useState<boolean>(false);
    const runner: Runner = usePreviewRunner(failure, editing, setPreview, (): void => {
        setAskingConsent(true);
    });
    const clearFile = (): void => {
        runner.reset();
        setFile(null);
        setPreview(null);
        setAskingConsent(false);
        editing.reset();
        failure.clear();
    };
    return {
        askingConsent,
        sendToModel: (): void => {
            setAskingConsent(false);
            if (file !== null) {
                runner.run(file, holder, true);
            }
        },
        declineModel: clearFile,
        file,
        holder,
        preview,
        previewing: runner.previewing,
        pickFile: (picked: File): void => {
            setFile(picked);
            setAskingConsent(false);
            runner.run(picked, holder);
        },
        clearFile,
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

export function useInvestmentImportFlow(): InvestmentImportFlow {
    const failure: Failure = useFailure();
    const editing: Editing = useEditing();
    const step: PreviewStep = usePreviewStep(failure, editing);
    const review: ReviewState = useReviewState(step.preview, step.holder, editing);
    const derived: Derived = { lines: review.lines, titles: review.titles, rows: review.rows };
    const committed: CommitStep = useCommitStep(failure, { preview: step.preview, editing, titles: derived.titles, rows: derived.rows });
    return {
        ...step,
        ...editing,
        ...derived,
        errorMessage: failure.errorMessage,
        readiness: review.readiness,
        pendingTitles: review.pendingTitles,
        canConfirm: review.canConfirm,
        outcome: committed.outcome,
        committing: committed.committing,
        commit: committed.commit,
        restart: (): void => {
            step.clearFile();
            committed.dismiss();
        }
    };
}
