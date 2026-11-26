import type { TFunction } from 'i18next';

export const MAX_FILE_BYTES: number = 10 * 1024 * 1024;

export const IMPORT_ACCEPT: Readonly<Record<string, readonly string[]>> = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv'],
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/heic': ['.heic'],
    'image/heif': ['.heif'],
    'image/webp': ['.webp']
};

export const MODEL_CONSENT_REQUIRED: string = 'model.confirmation_required';

const TOO_LARGE_CODE: string = 'file-too-large';

export function importRejectionMessage(t: TFunction<'portfolioImports'>): (codes: readonly string[]) => string {
    return (codes: readonly string[]): string => (codes.includes(TOO_LARGE_CODE) ? t('file.tooLarge') : t('file.invalidType'));
}
