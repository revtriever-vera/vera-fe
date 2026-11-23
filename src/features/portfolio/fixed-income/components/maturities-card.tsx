import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { track } from '@/shared/lib/analytics';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { TableColumn } from '@/shared/ui/table';
import { useMaturities } from '../api/use-maturities.query';
import { MATURITY_ATTENTION_DAYS, MATURITY_REALLOCATE_DAYS, type MaturitiesResponse, type MaturityItem } from '../types';
import { daysBucket } from '../lib/time-to-maturity';
import { useWhenLabel } from '../lib/use-when-label';
import { FixedIncomeCard } from './fixed-income-card';
import { MaturityTitleCell } from './maturity-title-cell';
import { MaturityValueCell } from './maturity-value-cell';
import { QueryBody } from './query-body';
import { ReallocateButton } from './reallocate-button';
import { ResponsiveRows } from './responsive-rows';

function MaturityWhenCell({ item }: { readonly item: MaturityItem }): ReactElement {
    const locale: SupportedLocale = useLocale();
    const when: (days: number) => string = useWhenLabel();
    const attention: boolean = item.daysToMaturity <= MATURITY_ATTENTION_DAYS;
    return (
        <span className="flex flex-col">
            <span className="numeric">{formatIsoDate(item.maturityDate, locale)}</span>
            <span className={attention ? 'text-xs font-bold text-caution' : 'text-xs text-content-muted'}>{when(item.daysToMaturity)}</span>
        </span>
    );
}

function useColumns(reference: MaturitiesResponse['reference']): readonly TableColumn<MaturityItem>[] {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    return [
        {
            key: 'title',
            header: t('maturities.columns.title'),
            render: (item: MaturityItem): ReactElement => <MaturityTitleCell item={item} />
        },
        {
            key: 'when',
            header: t('maturities.columns.maturity'),
            render: (item: MaturityItem): ReactElement => <MaturityWhenCell item={item} />
        },
        {
            key: 'value',
            header: t('maturities.columns.value'),
            align: 'right',
            render: (item: MaturityItem): ReactElement => <MaturityValueCell item={item} reference={reference} />
        },
        {
            key: 'action',
            header: '',
            align: 'right',
            render: (item: MaturityItem): ReactElement => (
                <ReallocateButton
                    item={item}
                    primary={item.daysToMaturity <= MATURITY_REALLOCATE_DAYS}
                    onClick={(): void => {
                        track('maturity_reallocate_clicked', { daysBucket: daysBucket(item.daysToMaturity) });
                    }}
                />
            )
        }
    ];
}

function MaturitiesTable({ data }: { readonly data: MaturitiesResponse }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const columns: readonly TableColumn<MaturityItem>[] = useColumns(data.reference);
    if (data.items.length === 0) {
        return <p className="text-sm text-content-muted">{t('maturities.empty')}</p>;
    }
    return (
        <ResponsiveRows
            label={t('maturities.listLabel')}
            columns={columns}
            rows={data.items}
            rowKey={(item: MaturityItem): string => `${item.holdingKind}-${item.id}`}
            minWidthClass={MIN_WIDTH}
        />
    );
}

const MIN_WIDTH: string = 'min-w-[620px]';

export function MaturitiesCard({ showBrlNote }: { readonly showBrlNote: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const query: UseQueryResult<MaturitiesResponse> = useMaturities();
    return (
        <FixedIncomeCard title={t('maturities.title')} description={t('maturities.description')} showBrlNote={showBrlNote}>
            <QueryBody query={query} loadingLabel={t('maturities.loading')}>
                {(data: MaturitiesResponse): ReactElement => <MaturitiesTable data={data} />}
            </QueryBody>
        </FixedIncomeCard>
    );
}
