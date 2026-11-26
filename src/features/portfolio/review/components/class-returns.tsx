import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { useClasses } from '../../api/use-classes.query';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';
import { classReasonText } from '../lib/return-rows';
import type { ClassReturn, MonthlyReview } from '../types';
import { ReturnBars, type ReturnBarRow } from './return-bars';

export interface ClassReturnsProps {
    readonly review: MonthlyReview;
    readonly benchmarks: readonly ReturnBarRow[];
}

function useClassRows(review: MonthlyReview): readonly ReturnBarRow[] {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const locale: SupportedLocale = useLocale();
    const label: ClassLabel = useClassLabel();
    const classes: ReturnType<typeof useClasses> = useClasses();
    const byId: ReadonlyMap<string, AssetClassView> = new Map(
        (classes.data?.data ?? []).map((view: AssetClassView): [string, AssetClassView] => [view.id, view])
    );
    return review.byClass.map((item: ClassReturn): ReturnBarRow => {
        const view: AssetClassView | undefined = item.classId === null ? undefined : byId.get(item.classId);
        const name: string = item.classId === null ? t('returns.otherClass') : label(view?.systemKey ?? null, view?.name ?? null);
        const values: string = t('returns.values', {
            start: formatCurrency(item.startMinor, review.baseCurrency, locale),
            end: formatCurrency(item.endMinor, review.baseCurrency, locale)
        });
        return {
            key: item.classId ?? 'none',
            label: name,
            pct: item.returnPct ?? null,
            note: item.returnPct === undefined ? classReasonText(t, item.reason) : values
        };
    });
}

export function ClassReturns({ review, benchmarks }: ClassReturnsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const rows: readonly ReturnBarRow[] = useClassRows(review);
    return (
        <Card className="flex flex-col gap-2">
            <div>
                <h3 className="text-base font-semibold">{t('returns.byClassTitle')}</h3>
                <p className="text-sm text-content-muted">{t('returns.byClassDescription')}</p>
            </div>
            <ReturnBars rows={[...rows, ...benchmarks]} />
        </Card>
    );
}
