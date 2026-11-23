import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { TableColumn } from '@/shared/ui/table';
import { isIndexDataMissing, useRealRates } from '../api/use-real-rates.query';
import { formatShareBps } from '../../lib/format-bps';
import { contractedRateLabel } from '../lib/contracted-rate-label';
import type { RealRateItem, RealRatesResponse } from '../types';
import { FixedIncomeCard } from './fixed-income-card';
import { QueryBody } from './query-body';
import { GainCell, PercentCell, RealRateCell, RealRateTitleCell } from './real-rate-cells';
import { ResponsiveRows } from './responsive-rows';

function useColumns(): readonly TableColumn<RealRateItem>[] {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const locale: SupportedLocale = useLocale();
    return [
        {
            key: 'title',
            header: t('realRate.columns.title'),
            render: (item: RealRateItem): ReactElement => <RealRateTitleCell item={item} />
        },
        {
            key: 'contracted',
            header: t('realRate.columns.contracted'),
            render: (item: RealRateItem): string => contractedRateLabel(t, item, locale)
        },
        {
            key: 'nominal',
            header: t('realRate.columns.nominal'),
            align: 'right',
            render: (item: RealRateItem): ReactElement => <PercentCell bps={item.nominalAnnualBps} />
        },
        {
            key: 'real',
            header: t('realRate.columns.real'),
            align: 'right',
            render: (item: RealRateItem): ReactElement => <RealRateCell item={item} />
        },
        {
            key: 'gain',
            header: t('realRate.columns.gain'),
            align: 'right',
            render: (item: RealRateItem): ReactElement => <GainCell item={item} />
        }
    ];
}

function RealRateTable({ data }: { readonly data: RealRatesResponse }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const columns: readonly TableColumn<RealRateItem>[] = useColumns();
    if (data.items.length === 0) {
        return <p className="text-sm text-content-muted">{t('realRate.empty')}</p>;
    }
    return (
        <>
            <ResponsiveRows
                label={t('realRate.listLabel')}
                columns={columns}
                rows={data.items}
                rowKey={(item: RealRateItem): string => item.id}
                minWidthClass="min-w-[680px]"
            />
            <p className="text-xs text-content-muted">{t('realRate.note')}</p>
        </>
    );
}

export function RealRateCard({ showBrlNote }: { readonly showBrlNote: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const locale: SupportedLocale = useLocale();
    const query: UseQueryResult<RealRatesResponse> = useRealRates();
    const description: string =
        query.data === undefined
            ? t('realRate.descriptionNoIpca')
            : t('realRate.description', { ipca: formatShareBps(query.data.reference.ipca12mBps, locale, 1) });
    return (
        <FixedIncomeCard title={t('realRate.title')} description={description} showBrlNote={showBrlNote}>
            {isIndexDataMissing(query.error) ? (
                <Alert tone="caution" title={t('realRate.unavailableTitle')} detail={t('realRate.unavailableDetail')} />
            ) : (
                <QueryBody query={query} loadingLabel={t('realRate.loading')}>
                    {(data: RealRatesResponse): ReactElement => <RealRateTable data={data} />}
                </QueryBody>
            )}
        </FixedIncomeCard>
    );
}
