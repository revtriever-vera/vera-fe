import type { ReactElement } from 'react';
import { Info } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';

export interface CalculationNoteProps {
    readonly totalAfterMinor: number;
    readonly currency: string;
}

export function CalculationNote({ totalAfterMinor, currency }: CalculationNoteProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const locale: SupportedLocale = useLocale();
    return (
        <aside aria-label={t('note.title')} className="flex gap-2 text-xs text-content-muted">
            <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <div className="flex flex-col gap-1.5">
                <p>{t('note.calculation', { total: formatCurrency(totalAfterMinor, currency, locale) })}</p>
                <p className="font-semibold text-content">{t('note.disclaimer')}</p>
            </div>
        </aside>
    );
}
