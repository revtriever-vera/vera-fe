import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { FIXED_INCOME_KINDS, type FixedIncomeKind } from '../../assets/types';

function isFixedIncomeKind(kind: string): kind is FixedIncomeKind {
    return (FIXED_INCOME_KINDS as readonly string[]).includes(kind);
}

export function useKindLabel(): (kind: string) => string {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (kind: string): string => (isFixedIncomeKind(kind) ? t(`fixedIncome.kinds.${kind}`) : kind.toUpperCase());
}
