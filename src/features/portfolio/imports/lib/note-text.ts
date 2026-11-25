import type { TFunction } from 'i18next';
import type { PreviewNote } from '../types';

export function noteText(t: TFunction<'portfolioImports'>, note: PreviewNote): string {
    switch (note.code) {
        case 'position_report_not_applied':
            return t('notes.position_report_not_applied');
        case 'fixed_income_pending':
            return t('notes.fixed_income_pending');
        case 'rows_rejected':
            return t('notes.rows_rejected', { count: note.count });
        case 'rows_ignored':
            return t('notes.rows_ignored', { count: note.count });
        default:
            return t('notes.generic', { count: note.count });
    }
}
