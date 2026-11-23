import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Money } from '@/shared/ui/money';
import type { TableColumn } from '@/shared/ui/table';
import { useFgc } from '../api/use-fgc.query';
import type { FgcCoverage, FgcGroup } from '../types';
import { GroupNameCell, OverLimitCell } from './fgc-group-cells';
import { FgcMeter } from './fgc-meter';
import { FgcOutsideNotes } from './fgc-outside-notes';
import { FixedIncomeCard } from './fixed-income-card';
import { QueryBody } from './query-body';
import { ResponsiveRows } from './responsive-rows';

const PEOPLE_FOR_PER_CPF_NOTE: number = 2;

function useColumns(): readonly TableColumn<FgcGroup>[] {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    return [
        { key: 'group', header: t('fgc.columns.group'), render: (group: FgcGroup): ReactElement => <GroupNameCell group={group} /> },
        {
            key: 'total',
            header: t('fgc.columns.total'),
            align: 'right',
            render: (group: FgcGroup): ReactElement => <Money amountMinor={group.totalMinor} currency="BRL" />
        },
        {
            key: 'covered',
            header: t('fgc.columns.covered'),
            align: 'right',
            render: (group: FgcGroup): ReactElement => <Money amountMinor={group.coveredMinor} currency="BRL" />
        },
        {
            key: 'over',
            header: t('fgc.columns.over'),
            align: 'right',
            render: (group: FgcGroup): ReactElement => <OverLimitCell group={group} />
        }
    ];
}

function FgcGroups({ groups }: { readonly groups: readonly FgcGroup[] }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const columns: readonly TableColumn<FgcGroup>[] = useColumns();
    if (groups.length === 0) {
        return <p className="text-sm text-content-muted">{t('fgc.empty')}</p>;
    }
    return (
        <ResponsiveRows
            label={t('fgc.listLabel')}
            columns={columns}
            rows={groups}
            rowKey={(group: FgcGroup): string => group.groupId}
            minWidthClass="min-w-[620px]"
        />
    );
}

function FgcContent({ coverage }: { readonly coverage: FgcCoverage }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    return (
        <div className="flex flex-col gap-4">
            <FgcMeter coverage={coverage} />
            <FgcGroups groups={coverage.groups} />
            {coverage.peopleCount >= PEOPLE_FOR_PER_CPF_NOTE ? (
                <p className="rounded-control bg-info/10 px-3 py-2 text-sm text-content">{t('fgc.perCpf')}</p>
            ) : null}
            <FgcOutsideNotes outside={coverage.outside} />
        </div>
    );
}

export function FgcCard({ showBrlNote }: { readonly showBrlNote: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const query: UseQueryResult<FgcCoverage> = useFgc();
    return (
        <FixedIncomeCard title={t('fgc.title')} description={t('fgc.description')} showBrlNote={showBrlNote}>
            <QueryBody query={query} loadingLabel={t('fgc.loading')}>
                {(coverage: FgcCoverage): ReactElement => <FgcContent coverage={coverage} />}
            </QueryBody>
        </FixedIncomeCard>
    );
}
