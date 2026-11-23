import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { FileDrop } from '@/shared/ui/file-drop';
import { IMPORT_ACCEPT, MAX_FILE_BYTES, importRejectionMessage } from '../lib/import-file-rules';
import { ImportHistory } from './import-history';
import { ImportStatementModal } from './import-statement-modal';

export function ImportCard(): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const [picked, setPicked] = useState<File | null>(null);
    return (
        <Card className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-content">{t('card.title')}</h2>
                <p className="text-sm text-content-muted">{t('card.description')}</p>
            </div>
            <FileDrop
                label={t('file.label')}
                title={t('file.dropTitle')}
                hint={t('file.hint')}
                accept={IMPORT_ACCEPT}
                maxSizeBytes={MAX_FILE_BYTES}
                fileName={null}
                onPicked={setPicked}
                onClear={(): void => {
                    setPicked(null);
                }}
                rejectionMessage={importRejectionMessage(t)}
            />
            <ImportHistory />
            {picked === null ? null : (
                <ImportStatementModal
                    initialFile={picked}
                    onClose={(): void => {
                        setPicked(null);
                    }}
                />
            )}
        </Card>
    );
}
