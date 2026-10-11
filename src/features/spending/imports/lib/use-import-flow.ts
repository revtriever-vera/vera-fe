import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { ApiError } from '@/shared/lib/api/api-error';
import type { ImportCreated, ImportPreview } from '../../types';
import { useCommitImport, type CommitImportInput } from '../api/use-commit-import.mutation';
import { usePreviewImport, type PreviewImportInput } from '../api/use-preview-import.mutation';
import type { CsvMapping } from '../schemas/mapping.schema';
import type { ImportTarget } from './build-import-form-data';
import { importErrorMessage, type ImportCurrencies } from './import-error-message';
import { saveMapping } from './saved-mapping';

type Failure = (error: Error, title: string, currencies: ImportCurrencies) => void;

export interface ImportFlow {
    readonly file: File | null;
    readonly preview: ImportPreview | null;
    readonly mapping: CsvMapping | null;
    readonly result: ImportCreated | null;
    readonly errorMessage: string | null;
    readonly previewing: boolean;
    readonly committing: boolean;
    readonly pickFile: (file: File) => void;
    readonly clearFile: () => void;
    readonly applyMapping: (mapping: CsvMapping) => void;
    readonly commit: (target: ImportTarget, accountCurrency: string) => void;
    readonly restart: () => void;
}

interface FailureState {
    readonly errorMessage: string | null;
    readonly setErrorMessage: (message: string | null) => void;
    readonly fail: Failure;
}

function useFailure(): FailureState {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const { t: ti }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const toast: ToastApi = useToast();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fail: Failure = (error: Error, title: string, currencies: ImportCurrencies): void => {
        const message: string = importErrorMessage(t, ti, error, currencies);
        if (error instanceof ApiError) {
            setErrorMessage(message);
            return;
        }
        toast.show({ tone: 'critical', title, detail: message });
    };
    return { errorMessage, setErrorMessage, fail };
}

interface PreviewFlow {
    readonly file: File | null;
    readonly preview: ImportPreview | null;
    readonly mapping: CsvMapping | null;
    readonly previewing: boolean;
    readonly pickFile: (file: File) => void;
    readonly clearFile: () => void;
    readonly applyMapping: (mapping: CsvMapping) => void;
}

function usePreviewFlow(failure: FailureState): PreviewFlow {
    const { t: ti }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const mutation: UseMutationResult<ImportPreview, ApiError, PreviewImportInput> = usePreviewImport();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<ImportPreview | null>(null);
    const [mapping, setMapping] = useState<CsvMapping | null>(null);
    const run = (input: PreviewImportInput, applied: CsvMapping | null): void => {
        failure.setErrorMessage(null);
        mutation.mutate(input, {
            onSuccess: (next: ImportPreview): void => {
                setPreview(next);
                setMapping(applied);
            },
            onError: (error: Error): void => {
                failure.fail(error, ti('toasts.previewFailed'), { statement: null, account: null });
            }
        });
    };
    const clearFile = (): void => {
        mutation.reset();
        setFile(null);
        setPreview(null);
        setMapping(null);
        failure.setErrorMessage(null);
    };
    const pickFile = (picked: File): void => {
        setFile(picked);
        setPreview(null);
        setMapping(null);
        run({ file: picked }, null);
    };
    const applyMapping = (next: CsvMapping): void => {
        if (file !== null) {
            run({ file, format: 'csv_generic', mapping: next }, next);
        }
    };
    return { file, preview, mapping, previewing: mutation.isPending, pickFile, clearFile, applyMapping };
}

interface CommitFlow {
    readonly result: ImportCreated | null;
    readonly committing: boolean;
    readonly commit: (target: ImportTarget, accountCurrency: string) => void;
    readonly dismissResult: () => void;
}

function useCommitFlow(failure: FailureState, source: PreviewFlow): CommitFlow {
    const { t: ti }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const mutation: UseMutationResult<ImportCreated, ApiError, CommitImportInput> = useCommitImport();
    const [result, setResult] = useState<ImportCreated | null>(null);
    const { file, preview, mapping } = source;
    const commit = (target: ImportTarget, accountCurrency: string): void => {
        const generic: boolean = preview?.format === 'csv_generic';
        if (file === null || preview === null || (generic && mapping === null)) {
            return;
        }
        failure.setErrorMessage(null);
        const applied: CsvMapping | undefined = generic && mapping !== null ? mapping : undefined;
        mutation.mutate(
            { file, format: preview.format, mapping: applied, target },
            {
                onSuccess: (created: ImportCreated): void => {
                    if (applied !== undefined) {
                        saveMapping(file.name, applied);
                    }
                    setResult(created);
                },
                onError: (error: Error): void => {
                    failure.fail(error, ti('toasts.importFailed'), { statement: preview.currency, account: accountCurrency });
                }
            }
        );
    };
    const dismissResult = (): void => {
        setResult(null);
    };
    return { result, committing: mutation.isPending, commit, dismissResult };
}

export function useImportFlow(): ImportFlow {
    const failure: FailureState = useFailure();
    const preview: PreviewFlow = usePreviewFlow(failure);
    const commit: CommitFlow = useCommitFlow(failure, preview);
    const restart = (): void => {
        preview.clearFile();
        commit.dismissResult();
    };
    return { ...preview, ...commit, errorMessage: failure.errorMessage, restart };
}
