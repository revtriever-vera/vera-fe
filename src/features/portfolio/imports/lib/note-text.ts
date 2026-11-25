import type { TFunction } from 'i18next';
import type { PreviewNote } from '../types';

const COUNTED_CODES: ReadonlySet<string> = new Set([
    'rows_rejected',
    'rows_ignored',
    'note_total_mismatch',
    'note_net_mismatch',
    'foreign_cash_movement',
    'foreign_position_not_applied',
    'foreign_tax_unmatched',
    'foreign_rate_fallback',
    'foreign_rate_missing',
    'lines_to_check',
    'crypto_transfer_check',
    'crypto_usd_rate_applied',
    'crypto_fee_not_converted'
]);

export function noteText(t: TFunction<'portfolioImports'>, note: PreviewNote): string {
    switch (note.code) {
        case 'position_report_not_applied':
            return t('notes.position_report_not_applied');
        case 'fixed_income_pending':
            return t('notes.fixed_income_pending');
        default:
            return t(COUNTED_CODES.has(note.code) ? (`notes.${note.code}` as 'notes.generic') : 'notes.generic', { count: note.count });
    }
}
