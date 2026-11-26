import type { TFunction } from 'i18next';

const TOO_LARGE_CODE: string = 'file-too-large';

export function importRejectionMessage(t: TFunction<'portfolioImports'>): (codes: readonly string[]) => string {
    return (codes: readonly string[]): string => (codes.includes(TOO_LARGE_CODE) ? t('file.tooLarge') : t('file.invalidType'));
}
