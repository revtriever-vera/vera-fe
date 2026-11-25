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
        case 'note_total_mismatch':
            return t('notes.note_total_mismatch', { count: note.count });
        case 'note_net_mismatch':
            return t('notes.note_net_mismatch', { count: note.count });
        case 'foreign_cash_movement':
            return t('notes.foreign_cash_movement', { count: note.count });
        case 'foreign_position_not_applied':
            return t('notes.foreign_position_not_applied', { count: note.count });
        case 'foreign_tax_unmatched':
            return t('notes.foreign_tax_unmatched', { count: note.count });
        default:
            return t('notes.generic', { count: note.count });
    }
}
