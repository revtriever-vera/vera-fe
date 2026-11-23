import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Money } from '@/shared/ui/money';
import type { TableColumn } from '@/shared/ui/table';
import { useFgc } from '../api/use-fgc.query';
import type { HolderParam } from '../../lib/holder-filter';
import { useHolderParam } from '../../lib/use-holder-param';
import type { FgcCoverage, FgcGroup, FgcHolderBlock, FgcOutside } from '../types';
import { GroupNameCell, OverLimitCell } from './fgc-group-cells';
import { FgcMeter } from './fgc-meter';
import { FgcOutsideNotes } from './fgc-outside-notes';
import { FixedIncomeCard } from './fixed-income-card';
import { QueryBody } from './query-body';
import { ResponsiveRows } from './responsive-rows';

const PEOPLE_FOR_PER_CPF_NOTE: number = 2;
const MIN_WIDTH: string = 'min-w-[620px]';

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
            minWidthClass={MIN_WIDTH}
        />
    );
}

interface FgcBlockProps {
    readonly coverage: FgcCoverage;
    readonly coveredMinor: number;
    readonly capShareBps: number;
    readonly groups: readonly FgcGroup[];
    readonly outside: readonly FgcOutside[];
}

function FgcBlock({ coverage, coveredMinor, capShareBps, groups, outside }: FgcBlockProps): ReactElement {
    return (
        <div className="flex flex-col gap-4">
            <FgcMeter coveredMinor={coveredMinor} capMinor={coverage.capMinor} capShareBps={capShareBps} currency={coverage.currency} />
            <FgcGroups groups={groups} />
            <FgcOutsideNotes outside={outside} />
        </div>
    );
}

function HolderBlock({ coverage, block }: { readonly coverage: FgcCoverage; readonly block: FgcHolderBlock }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    return (
        <section aria-label={block.holder?.name ?? t('fgc.wholeAccount')} className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold">{block.holder?.name ?? t('fgc.wholeAccount')}</h4>
            <FgcBlock
                coverage={coverage}
                coveredMinor={block.coveredMinor}
                capShareBps={block.capShareBps}
                groups={block.groups}
                outside={block.outside}
            />
        </section>
    );
}

function FgcContent({ coverage }: { readonly coverage: FgcCoverage }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    return (
        <div className="flex flex-col gap-4">
            {coverage.byHolder.length === 0 ? (
                <FgcBlock
                    coverage={coverage}
                    coveredMinor={coverage.coveredMinor}
                    capShareBps={coverage.capShareBps}
                    groups={coverage.groups}
                    outside={coverage.outside}
                />
            ) : (
                coverage.byHolder.map((block: FgcHolderBlock): ReactElement => (
                    <HolderBlock key={block.holder?.userId ?? 'account'} coverage={coverage} block={block} />
                ))
            )}
            {coverage.peopleCount >= PEOPLE_FOR_PER_CPF_NOTE ? (
                <p className="rounded-control bg-info/10 px-3 py-2 text-sm text-content">{t('fgc.perCpf')}</p>
            ) : null}
        </div>
    );
}

export function FgcCard({ showBrlNote }: { readonly showBrlNote: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const holder: HolderParam = useHolderParam();
    const query: UseQueryResult<FgcCoverage> = useFgc(holder);
    return (
        <FixedIncomeCard title={t('fgc.title')} description={t('fgc.description')} showBrlNote={showBrlNote}>
            <QueryBody query={query} loadingLabel={t('fgc.loading')}>
                {(coverage: FgcCoverage): ReactElement => <FgcContent coverage={coverage} />}
            </QueryBody>
        </FixedIncomeCard>
    );
}
