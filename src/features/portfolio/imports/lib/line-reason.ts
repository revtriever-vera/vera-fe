import type { TFunction } from 'i18next';

type ReasonKey =
    | 'reasons.asset_not_found'
    | 'reasons.asset_not_available'
    | 'reasons.sell_exceeds_position'
    | 'reasons.event_factor'
    | 'reasons.invalid_quantity'
    | 'reasons.unsupported_direction'
    | 'reasons.position_mode_required'
    | 'reasons.assumed_cost'
    | 'reasons.amount_mismatch'
    | 'reasons.total_mismatch'
    | 'reasons.date_out_of_range'
    | 'reasons.position_mismatch'
    | 'reasons.net_mismatch'
    | 'reasons.out_of_order'
    | 'reasons.duplicate'
    | 'reasons.skipped'
    | 'reasons.generic';

const REASON_KEYS: Readonly<Record<string, ReasonKey>> = {
    asset_not_found: 'reasons.asset_not_found',
    asset_not_available: 'reasons.asset_not_available',
    sell_exceeds_position: 'reasons.sell_exceeds_position',
    event_factor: 'reasons.event_factor',
    invalid_quantity: 'reasons.invalid_quantity',
    unsupported_direction: 'reasons.unsupported_direction',
    position_mode_required: 'reasons.position_mode_required',
    assumed_cost: 'reasons.assumed_cost',
    amount_mismatch: 'reasons.amount_mismatch',
    total_mismatch: 'reasons.total_mismatch',
    date_out_of_range: 'reasons.date_out_of_range',
    position_mismatch: 'reasons.position_mismatch',
    net_mismatch: 'reasons.net_mismatch',
    out_of_order: 'reasons.out_of_order',
    duplicate: 'reasons.duplicate',
    skipped: 'reasons.skipped'
};

export function lineReasonText(t: TFunction<'portfolioImports'>, reason: string | null): string {
    return t(REASON_KEYS[reason ?? ''] ?? 'reasons.generic');
}
