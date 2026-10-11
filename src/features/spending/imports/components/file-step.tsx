import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { FileDrop } from '@/shared/ui/file-drop';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useAccounts } from '../../api/use-accounts.query';
import type { AccountView, AccountsResponse } from '../../types';
import type { ImportFlow } from '../lib/use-import-flow';
import { loadSavedMapping } from '../lib/saved-mapping';
import { EMPTY_MAPPING_VALUES, toMappingFormValues, type CsvMapping, type MappingFormValues } from '../schemas/mapping.schema';
import { AccountTarget } from './account-target';
import { MappingForm } from './mapping-form';
import { PreviewSampleTable } from './preview-sample-table';
import { PreviewSummary } from './preview-summary';

export const IMPORT_FORM_ID: string = 'import-target-form';
export const MAX_FILE_BYTES: number = 5 * 1024 * 1024;

const ACCEPT: Readonly<Record<string, readonly string[]>> = {
    'application/x-ofx': ['.ofx'],
    'text/csv': ['.csv'],
    'text/plain': ['.txt']
};

const TOO_LARGE_CODE: string = 'file-too-large';

function initialMapping(fileName: string): MappingFormValues {
    const saved: CsvMapping | null = loadSavedMapping(fileName);
    return saved === null ? EMPTY_MAPPING_VALUES : toMappingFormValues(saved);
}

function PreviewBody({ flow, accounts }: { readonly flow: ImportFlow; readonly accounts: readonly AccountView[] }): ReactElement | null {
    const { file, preview } = flow;
    if (file === null || preview === null) {
        return null;
    }
    const generic: boolean = preview.format === 'csv_generic' && preview.columns !== null;
    return (
        <div className="flex flex-col gap-4">
            <PreviewSummary preview={preview} awaitingMapping={generic && flow.mapping === null} />
            {generic && preview.columns !== null ? (
                <MappingForm
                    key={file.name}
                    columns={preview.columns}
                    initial={initialMapping(file.name)}
                    busy={flow.previewing}
                    onSubmit={flow.applyMapping}
                />
            ) : null}
            <PreviewSampleTable preview={preview} />
            <AccountTarget formId={IMPORT_FORM_ID} preview={preview} accounts={accounts} onSubmit={flow.commit} />
        </div>
    );
}

function AccountsGate({ flow }: { readonly flow: ImportFlow }): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const accounts: UseQueryResult<AccountsResponse> = useAccounts();
    if (accounts.isError) {
        return <Alert title={t('errors.generic')} />;
    }
    if (accounts.data === undefined) {
        return <Skeleton className="h-24 w-full" />;
    }
    const usable: readonly AccountView[] = accounts.data.accounts.filter((account: AccountView): boolean => !account.isSample);
    return <PreviewBody flow={flow} accounts={usable} />;
}

export function FileStep({ flow }: { readonly flow: ImportFlow }): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const rejectionMessage = (codes: readonly string[]): string =>
        codes.includes(TOO_LARGE_CODE) ? t('file.tooLarge') : t('file.invalidType');
    return (
        <div className="flex flex-col gap-4">
            <FileDrop
                label={t('file.label')}
                hint={t('file.hint')}
                accept={ACCEPT}
                maxSizeBytes={MAX_FILE_BYTES}
                fileName={flow.file?.name ?? null}
                onPicked={flow.pickFile}
                onClear={flow.clearFile}
                rejectionMessage={rejectionMessage}
            />
            {flow.errorMessage === null ? null : <Alert title={flow.errorMessage} />}
            {flow.previewing && flow.preview === null ? (
                <Loading label={t('file.reading')}>
                    <Skeleton className="h-24 w-full" />
                </Loading>
            ) : null}
            {flow.preview === null ? null : <AccountsGate flow={flow} />}
        </div>
    );
}
