import type { ReactElement } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Money } from '@/shared/ui/money';
import { Table, type TableColumn } from '@/shared/ui/table';
import { RichBalloon } from '@/shared/ui/tooltip';
import { ClassName } from '../../components/class-name';
import { ClassTile } from '../../components/class-tile';
import { StatusChip } from '../../components/status-chip';
import { formatShareBps, formatTargetBps } from '../../lib/format-bps';
import { isSystemClassKey } from '../../lib/class-icons';
import type { ClassRow } from '../lib/overview-view-model';
import { ClassSegmentTooltip } from './class-segment-tooltip';
import { Gauge } from './gauge';

const MIN_WIDTH: string = 'min-w-[640px]';
const DIMMED: string = 'opacity-60';

export interface ClassTableProps {
    readonly rows: readonly ClassRow[];
    readonly currency: string;
}

function ClassIdentity({ row }: { readonly row: ClassRow }): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    return (
        <span className="flex min-w-0 items-center gap-3">
            <ClassTile systemKey={row.systemKey} colorKey={row.colorKey} />
            <span className="min-w-0">
                <ClassName systemKey={row.systemKey} name={row.name} className="block truncate font-semibold" />
                {row.systemKey !== null && isSystemClassKey(row.systemKey) ? (
                    <span className="block truncate text-xs text-content-muted">{t(`classes.descriptions.${row.systemKey}`)}</span>
                ) : null}
            </span>
        </span>
    );
}

function GaugeCell({ row, currency }: { readonly row: ClassRow; readonly currency: string }): ReactElement {
    return (
        <RichBalloon content={<ClassSegmentTooltip row={row} emphasis="both" currency={currency} />}>
            <div>
                <Gauge shareBps={row.shareBps} targetBps={row.targetBps} colorKey={row.colorKey} />
            </div>
        </RichBalloon>
    );
}

function useColumns(currency: string): readonly TableColumn<ClassRow>[] {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const locale: SupportedLocale = useLocale();
    return [
        { key: 'class', header: t('table.columns.class'), render: (row: ClassRow): ReactElement => <ClassIdentity row={row} /> },
        {
            key: 'value',
            header: t('table.columns.value'),
            align: 'right',
            render: (row: ClassRow): ReactElement => <Money amountMinor={row.valueMinor} currency={currency} />
        },
        {
            key: 'actual',
            header: t('table.columns.actual'),
            align: 'right',
            render: (row: ClassRow): string => formatShareBps(row.shareBps, locale)
        },
        {
            key: 'target',
            header: t('table.columns.target'),
            align: 'right',
            render: (row: ClassRow): string => formatTargetBps(row.targetBps, locale)
        },
        {
            key: 'gauge',
            header: t('table.columns.gauge'),
            render: (row: ClassRow): ReactElement => <GaugeCell row={row} currency={currency} />
        },
        {
            key: 'status',
            header: t('table.columns.status'),
            render: (row: ClassRow): ReactElement => <StatusChip status={row.status} deviationBps={row.deviationBps} />
        }
    ];
}

export function ClassTable({ rows, currency }: ClassTableProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const navigate: UseNavigateResult<string> = useNavigate();
    const columns: readonly TableColumn<ClassRow>[] = useColumns(currency);
    return (
        <Table
            label={t('table.label')}
            columns={columns}
            rows={rows}
            rowKey={(row: ClassRow): string => row.classId}
            minWidthClass={MIN_WIDTH}
            rowClassName={(row: ClassRow): string | undefined => (row.dimmed ? DIMMED : undefined)}
            onRowActivate={(row: ClassRow): void => {
                void navigate({ to: '/portfolio/classes/$classId', params: { classId: row.classId } });
            }}
        />
    );
}
