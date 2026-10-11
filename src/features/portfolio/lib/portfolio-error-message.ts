import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';

export type PortfolioErrorKey =
    | 'errors.generic'
    | 'errors.validationFailed'
    | 'errors.assetNotFound'
    | 'errors.assetAlreadyInPortfolio'
    | 'errors.positionNotFound'
    | 'errors.invalidQuantity'
    | 'errors.classRequired'
    | 'errors.positionLimitReached'
    | 'errors.titleNotFound'
    | 'errors.appliedDateOutOfRange'
    | 'errors.invalidTerms'
    | 'errors.classNotFound'
    | 'errors.classNameTaken'
    | 'errors.classNotEmpty'
    | 'errors.cannotMergeIntoSelf'
    | 'errors.classLimitReached'
    | 'errors.assignmentNotFound'
    | 'errors.targetsMustSum100'
    | 'errors.targetsIncomplete'
    | 'errors.contributionTargetsNotSet'
    | 'errors.exchangeRateUnavailable';

export const PORTFOLIO_ERROR_KEYS: Readonly<Record<string, PortfolioErrorKey>> = {
    validation_failed: 'errors.validationFailed',
    'catalog.asset_not_found': 'errors.assetNotFound',
    'positions.asset_already_in_portfolio': 'errors.assetAlreadyInPortfolio',
    'positions.position_not_found': 'errors.positionNotFound',
    'positions.invalid_quantity': 'errors.invalidQuantity',
    'positions.class_required': 'errors.classRequired',
    'positions.limit_reached': 'errors.positionLimitReached',
    'fixed_income.title_not_found': 'errors.titleNotFound',
    'fixed_income.applied_date_out_of_range': 'errors.appliedDateOutOfRange',
    'fixed_income.invalid_terms': 'errors.invalidTerms',
    'allocation.class_not_found': 'errors.classNotFound',
    'allocation.class_name_taken': 'errors.classNameTaken',
    'allocation.class_not_empty': 'errors.classNotEmpty',
    'allocation.cannot_merge_into_self': 'errors.cannotMergeIntoSelf',
    'allocation.class_limit_reached': 'errors.classLimitReached',
    'allocation.assignment_not_found': 'errors.assignmentNotFound',
    'allocation.targets_must_sum_100': 'errors.targetsMustSum100',
    'allocation.targets_incomplete': 'errors.targetsIncomplete',
    'contribution.targets_not_set': 'errors.contributionTargetsNotSet',
    'market-data.exchange_rate_unavailable': 'errors.exchangeRateUnavailable'
};

export function portfolioErrorMessage(t: TFunction<'portfolio'>, error: Error | null): string {
    const key: PortfolioErrorKey | undefined = error instanceof ApiError ? PORTFOLIO_ERROR_KEYS[error.problem.type] : undefined;
    return t(key ?? 'errors.generic');
}
