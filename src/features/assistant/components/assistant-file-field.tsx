import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { INVESTMENT_IMPORT_ACCEPT, INVESTMENT_IMPORT_MAX_FILE_BYTES } from '@/shared/lib/investment-import-files';
import { FileDrop } from '@/shared/ui/file-drop';

export interface AssistantFileFieldProps {
    readonly file: File | null;
    readonly onPicked: (file: File) => void;
    readonly onClear: () => void;
}

const TOO_LARGE_CODE: string = 'file-too-large';

export function AssistantFileField({ file, onPicked, onClear }: AssistantFileFieldProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <FileDrop
            label={t('composer.fileLabel')}
            title={t('composer.fileTitle')}
            hint={t('composer.fileHint')}
            accept={INVESTMENT_IMPORT_ACCEPT}
            maxSizeBytes={INVESTMENT_IMPORT_MAX_FILE_BYTES}
            fileName={file?.name ?? null}
            onPicked={onPicked}
            onClear={onClear}
            rejectionMessage={(codes: readonly string[]): string =>
                codes.includes(TOO_LARGE_CODE) ? t('composer.fileTooLarge') : t('composer.fileInvalidType')
            }
        />
    );
}
