import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';

export type InvestmentImportErrorKey =
    | 'errors.generic'
    | 'errors.formatNotRecognized'
    | 'errors.fileTooLarge'
    | 'errors.tooManyRows'
    | 'errors.previewExpired'
    | 'errors.undoBlocked'
    | 'errors.hasBlockedLines'
    | 'errors.positionModeRequired'
    | 'errors.invalidEdit'
    | 'errors.fixedIncomeDuplicate'
    | 'errors.modelUnavailable'
    | 'errors.modelUnreadable'
    | 'errors.tooManyRequests'
    | 'errors.forbidden';

export const INVESTMENT_IMPORT_ERROR_KEYS: Readonly<Record<string, InvestmentImportErrorKey>> = {
    'format.not_recognized': 'errors.formatNotRecognized',
    'file.too_large': 'errors.fileTooLarge',
    'format.too_many_rows': 'errors.tooManyRows',
    'preview.expired': 'errors.previewExpired',
    'import.undo_blocked': 'errors.undoBlocked',
    'import.has_blocked_lines': 'errors.hasBlockedLines',
    'import.position_mode_required': 'errors.positionModeRequired',
    'import.invalid_edit': 'errors.invalidEdit',
    'import.fixed_income_duplicate': 'errors.fixedIncomeDuplicate',
    'model.unavailable': 'errors.modelUnavailable',
    'model.unreadable': 'errors.modelUnreadable',
    'identity.insufficient_role': 'errors.forbidden'
};

const TOO_MANY_REQUESTS: number = 429;

function keyOf(error: Error | null): InvestmentImportErrorKey {
    if (!(error instanceof ApiError)) {
        return 'errors.generic';
    }
    if (error.status === TOO_MANY_REQUESTS) {
        return 'errors.tooManyRequests';
    }
    return INVESTMENT_IMPORT_ERROR_KEYS[error.problem.type] ?? 'errors.generic';
}

export function investmentImportErrorMessage(t: TFunction<'portfolioImports'>, error: Error | null): string {
    return t(keyOf(error));
}
