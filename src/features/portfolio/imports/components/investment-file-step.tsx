import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { formatIsoDate } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { FileDrop } from '@/shared/ui/file-drop';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { HolderField } from '../../assets/components/holder-field';
import { IMPORT_ACCEPT, MAX_FILE_BYTES, importRejectionMessage } from '../lib/import-file-rules';
import { noteText } from '../lib/note-text';
import type { InvestmentImportFlow } from '../lib/use-investment-import-flow';
import type { PreviewNote } from '../types';

function Notes({ notes }: { readonly notes: readonly PreviewNote[] }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    if (notes.length === 0) {
        return null;
    }
    return (
        <ul className="flex flex-col gap-1 text-sm text-content-muted">
            {notes.map((note: PreviewNote): ReactElement => (
                <li key={note.code}>{noteText(t, note)}</li>
            ))}
        </ul>
    );
}

function AlreadyImported({ at }: { readonly at: string | null }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const locale: SupportedLocale = useLocale();
    if (at === null) {
        return null;
    }
    return <Alert tone="caution" title={t('alreadyImported', { date: formatIsoDate(at, locale) })} />;
}

export function InvestmentFileStep({ flow }: { readonly flow: InvestmentImportFlow }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    return (
        <div className="flex flex-col gap-4">
            <HolderField value={flow.holder} onChange={flow.changeHolder} />
            <FileDrop
                label={t('file.label')}
                title={t('file.dropTitle')}
                hint={t('file.hint')}
                accept={IMPORT_ACCEPT}
                maxSizeBytes={MAX_FILE_BYTES}
                fileName={flow.file?.name ?? null}
                onPicked={flow.pickFile}
                onClear={flow.clearFile}
                rejectionMessage={importRejectionMessage(t)}
            />
            {flow.errorMessage === null ? null : <Alert title={flow.errorMessage} />}
            {flow.previewing ? (
                <Loading label={t('file.reading')}>
                    <Skeleton className="h-24 w-full" />
                </Loading>
            ) : null}
            <AlreadyImported at={flow.preview?.alreadyImportedAt ?? null} />
            <Notes notes={flow.preview?.notes ?? []} />
        </div>
    );
}
