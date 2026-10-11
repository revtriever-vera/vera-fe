import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { ClassName } from '../../components/class-name';
import { ClassTile } from '../../components/class-tile';
import { StatusChip } from '../../components/status-chip';
import { formatShareBps, formatTargetBps } from '../../lib/format-bps';
import type { ClassRow } from '../lib/overview-view-model';

export interface ClassCardListProps {
    readonly rows: readonly ClassRow[];
}

export function ClassCardList({ rows }: ClassCardListProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioOverview', undefined> = useTranslation('portfolioOverview');
    const locale: SupportedLocale = useLocale();
    return (
        <ul aria-label={t('table.listLabel')} className="flex flex-col gap-2">
            {rows.map((row: ClassRow): ReactElement => (
                <li key={row.classId}>
                    <Link
                        to="/patrimonio/classes/$classId"
                        params={{ classId: row.classId }}
                        className={cn('surface-card flex items-center gap-3 p-3', row.dimmed && 'opacity-60')}
                    >
                        <ClassTile systemKey={row.systemKey} colorKey={row.colorKey} />
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <ClassName systemKey={row.systemKey} name={row.name} className="truncate text-sm font-semibold" />
                            <span className="numeric text-xs text-content-muted">
                                {t('table.cardShares', {
                                    actual: formatShareBps(row.shareBps, locale),
                                    target: formatTargetBps(row.targetBps, locale)
                                })}
                            </span>
                        </span>
                        <StatusChip status={row.status} deviationBps={row.deviationBps} />
                    </Link>
                </li>
            ))}
        </ul>
    );
}
