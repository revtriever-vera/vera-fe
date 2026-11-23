import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useKindLabel } from '../lib/use-kind-label';
import type { MaturityItem } from '../types';

function useDetail(item: MaturityItem): string {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const kindLabel: (kind: string) => string = useKindLabel();
    if (item.holdingKind === 'position') {
        return t('maturities.tesouro');
    }
    if (item.issuerName === null) {
        return item.kind === null ? '' : kindLabel(item.kind);
    }
    return t('maturities.issuerLine', { issuer: item.issuerName, name: item.name });
}

export function MaturityTitleCell({ item }: { readonly item: MaturityItem }): ReactElement {
    const detail: string = useDetail(item);
    return (
        <span className="flex min-w-0 flex-col">
            <span className="font-semibold">{item.name}</span>
            <span className="text-xs text-content-muted">{detail}</span>
        </span>
    );
}
