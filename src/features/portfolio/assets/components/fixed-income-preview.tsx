import { CalendarDays, Info, Landmark, Target } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useMemo, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { ClassTile } from '../../components/class-tile';
import { formatShareBps } from '../../lib/format-bps';
import { toClassColorKey } from '../../lib/class-color';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView, ClassColorKey } from '../../types';
import { useFixedIncomePreview } from '../api/use-fixed-income-preview.query';
import { toPreviewBody } from '../lib/fixed-income-body';
import { annualizedBps, roundYears, yearsBetween } from '../lib/fixed-income-summary';
import type { FixedIncomeFormInput } from '../schemas/fixed-income.schema';
import type { FixedIncomePreview, FixedIncomePreviewBody } from '../types';
import { ValueToday } from './value-today';

const PREVIEW_DEBOUNCE_MS: number = 400;

export interface FixedIncomePreviewPanelProps {
    readonly values: FixedIncomeFormInput;
    readonly termsValid: boolean;
    readonly classes: readonly AssetClassView[];
}

function useDebouncedBody(values: FixedIncomeFormInput, termsValid: boolean): FixedIncomePreviewBody | null {
    const body: FixedIncomePreviewBody | null = termsValid ? toPreviewBody(values) : null;
    const debounced: string | null = useDebouncedValue(body === null ? null : JSON.stringify(body), PREVIEW_DEBOUNCE_MS);
    return useMemo(
        (): FixedIncomePreviewBody | null => (debounced === null ? null : (JSON.parse(debounced) as FixedIncomePreviewBody)),
        [debounced]
    );
}

function summaryOf(
    result: FixedIncomePreview,
    body: FixedIncomePreviewBody,
    t: ReturnType<typeof useTranslation<'portfolioAssets'>>['t'],
    locale: SupportedLocale
): string {
    const years: number = yearsBetween(body.appliedAt, result.matured ? body.maturityDate : result.asOf);
    const rate: number | null = annualizedBps(result.accruedBps, years);
    const yearsText: string = t('fixedIncome.preview.years', {
        count: roundYears(years) > 1 ? 2 : 1,
        years: new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(roundYears(years))
    });
    const applied: string = formatCurrency(body.appliedMinor, body.currency ?? 'BRL', locale);
    return rate === null
        ? t('fixedIncome.preview.summaryNoRate', { applied, years: yearsText })
        : t('fixedIncome.preview.summary', { applied, years: yearsText, rate: formatShareBps(rate, locale, 2) });
}

interface ResultProps {
    readonly result: FixedIncomePreview;
    readonly body: FixedIncomePreviewBody;
    readonly values: FixedIncomeFormInput;
    readonly classes: readonly AssetClassView[];
}

function ResultPills({ result, body, values, classes }: ResultProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const classLabel: ClassLabel = useClassLabel();
    const chosen: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === values.classId);
    return (
        <div className="flex flex-wrap gap-2">
            {chosen === undefined ? null : (
                <Badge>
                    <Target className="size-3" aria-hidden="true" />
                    {classLabel(chosen.systemKey, chosen.name)}
                </Badge>
            )}
            <Badge>
                <Landmark className="size-3" aria-hidden="true" />
                {t(`fixedIncome.preview.sources.${result.source}`)}
            </Badge>
            <Badge>
                <CalendarDays className="size-3" aria-hidden="true" />
                {t('fixedIncome.preview.maturesOn', { date: formatIsoDate(body.maturityDate, locale) })}
            </Badge>
            {result.matured ? <Badge tone="caution">{t('fixedIncome.preview.matured')}</Badge> : null}
        </div>
    );
}

function Result(props: ResultProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const { result, body }: ResultProps = props;
    const missing: boolean = result.status === 'index_data_missing';
    return (
        <>
            <ValueToday
                label={result.matured ? t('fixedIncome.preview.labelMatured') : t('fixedIncome.preview.label')}
                value={formatCurrency(missing ? body.appliedMinor : result.valueMinor, result.currency, locale)}
                legend={missing ? t('fixedIncome.preview.indexMissing') : summaryOf(result, body, t, locale)}
            />
            <ResultPills {...props} />
        </>
    );
}

function Header({ values, classes }: { readonly values: FixedIncomeFormInput; readonly classes: readonly AssetClassView[] }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const chosen: AssetClassView | undefined = classes.find((item: AssetClassView): boolean => item.id === values.classId);
    const colorKey: ClassColorKey = chosen === undefined ? toClassColorKey('') : toClassColorKey(chosen.colorKey);
    return (
        <div className="flex items-center gap-3">
            <ClassTile systemKey={chosen?.systemKey ?? null} colorKey={colorKey} />
            <span className="flex min-w-0 flex-col">
                <b className="truncate text-base font-bold text-content">
                    {values.name.trim() === '' ? t(`fixedIncome.kinds.${values.kind}`) : values.name.trim()}
                </b>
                <span className="text-sm text-content-muted">
                    {t('fixedIncome.preview.terms', {
                        kind: t(`fixedIncome.kinds.${values.kind}`),
                        indexer: t(`fixedIncome.indexers.${values.indexer}`)
                    })}
                </span>
            </span>
        </div>
    );
}

export function FixedIncomePreviewPanel({ values, termsValid, classes }: FixedIncomePreviewPanelProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const body: FixedIncomePreviewBody | null = useDebouncedBody(values, termsValid);
    const preview: UseQueryResult<FixedIncomePreview> = useFixedIncomePreview(body);
    return (
        <div className="flex flex-col gap-4" aria-busy={preview.isFetching}>
            <Header values={values} classes={classes} />
            {body === null ? <p className="text-sm text-content-muted">{t('fixedIncome.preview.empty')}</p> : null}
            {body !== null && preview.data === undefined && preview.isError ? (
                <Alert tone="caution" title={t('fixedIncome.preview.failed')} />
            ) : null}
            {body !== null && preview.data === undefined && !preview.isError ? <Skeleton className="h-28 w-full" /> : null}
            {body !== null && preview.data !== undefined ? (
                <Result result={preview.data} body={body} values={values} classes={classes} />
            ) : null}
            <p className="flex items-start gap-2 rounded-control bg-info/10 p-3 text-xs text-content">
                <Info className="mt-px size-4 shrink-0 text-info" aria-hidden="true" />
                {t('fixedIncome.preview.note')}
            </p>
        </div>
    );
}
