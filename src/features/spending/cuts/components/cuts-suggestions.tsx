import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { formatMonth } from '../../lib/format-month';
import type { CutsResponse } from '../../types';
import { CutsCardList } from './cuts-card-list';
import { CutsTable } from './cuts-table';

const NARROW_QUERY: string = '(max-width: 639px)';

export function CutsSuggestions({ cuts }: { readonly cuts: CutsResponse }): ReactElement | null {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    const narrow: boolean = useMediaQuery(NARROW_QUERY);
    if (cuts.suggestions.length === 0) {
        return null;
    }
    return (
        <section aria-labelledby="cuts-suggestions-title" className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 id="cuts-suggestions-title" className="text-lg font-bold">
                    {t('table.title', { month: formatMonth(cuts.limitMonth, locale) })}
                </h2>
                <p className="text-sm text-content-muted">{t('table.support')}</p>
                {cuts.isPartial ? <p className="text-sm text-caution">{t('table.partial')}</p> : null}
            </div>
            {narrow ? <CutsCardList cuts={cuts} /> : <CutsTable cuts={cuts} />}
        </section>
    );
}
