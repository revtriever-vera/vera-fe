import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { valueSourceKey } from '../../lib/value-source';
import type { HoldingView } from '../../types';

export function SourceCell({ holding }: { readonly holding: HoldingView }): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const locale: SupportedLocale = useLocale();
    return (
        <span className="flex flex-col text-xs text-content-muted">
            <span>{t(valueSourceKey(holding.valueSource))}</span>
            {holding.priceDate === null ? null : <span>{formatIsoDate(holding.priceDate, locale)}</span>}
        </span>
    );
}
