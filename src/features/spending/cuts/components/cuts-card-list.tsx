import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { formatMonthTitle } from '../../lib/format-month';
import type { CutSuggestion, CutsResponse } from '../../types';
import { AverageValue, CutCategory, CutValue, WholeAmount } from './cut-cells';

function Field({ label, children }: { readonly label: string; readonly children: ReactElement }): ReactElement {
    return (
        <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-content-subtle">{label}</dt>
            <dd className="text-sm">{children}</dd>
        </div>
    );
}

function CutCard({ suggestion, cuts }: { readonly suggestion: CutSuggestion; readonly cuts: CutsResponse }): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    const locale: SupportedLocale = useLocale();
    return (
        <li className="surface-card flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
                <CutCategory suggestion={suggestion} />
                <WholeAmount minor={suggestion.limitMinor} className="text-base font-bold" />
            </div>
            <dl className="grid grid-cols-3 gap-2">
                <Field label={formatMonthTitle(cuts.month, locale)}>
                    <WholeAmount minor={suggestion.spentMinor} />
                </Field>
                <Field label={t('table.columns.average')}>
                    <AverageValue suggestion={suggestion} averageMonths={cuts.averageMonths} />
                </Field>
                <Field label={t('table.columns.cut')}>
                    <CutValue cutMinor={suggestion.cutMinor} />
                </Field>
            </dl>
        </li>
    );
}

export function CutsCardList({ cuts }: { readonly cuts: CutsResponse }): ReactElement {
    const { t }: UseTranslationResponse<'spendingCuts', undefined> = useTranslation('spendingCuts');
    return (
        <ul aria-label={t('table.listLabel')} className="flex flex-col gap-3">
            {cuts.suggestions.map((suggestion: CutSuggestion): ReactElement => (
                <CutCard key={suggestion.categoryId} suggestion={suggestion} cuts={cuts} />
            ))}
        </ul>
    );
}
