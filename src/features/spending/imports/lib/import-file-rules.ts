import type { TFunction } from 'i18next';

export const MAX_FILE_BYTES: number = 5 * 1024 * 1024;

export const IMPORT_ACCEPT: Readonly<Record<string, readonly string[]>> = {
    'application/x-ofx': ['.ofx'],
    'text/csv': ['.csv'],
    'text/plain': ['.txt']
};

const TOO_LARGE_CODE: string = 'file-too-large';

export function importRejectionMessage(t: TFunction<'spendingImports'>): (codes: readonly string[]) => string {
    return (codes: readonly string[]): string => (codes.includes(TOO_LARGE_CODE) ? t('file.tooLarge') : t('file.invalidType'));
}
