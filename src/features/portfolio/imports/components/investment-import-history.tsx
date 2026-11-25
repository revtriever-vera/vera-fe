import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { formatIsoDate } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';
import { cn } from '@/shared/lib/cn';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Pager } from '@/shared/ui/pager';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { useInvestmentImports } from '../api/use-investment-imports.query';
import type { InvestmentImportList, InvestmentImportView } from '../types';
import { UndoInvestmentImportDialog } from './undo-investment-import-dialog';

interface ItemProps {
    readonly item: InvestmentImportView;
    readonly onUndo: (item: InvestmentImportView) => void;
}

function HistoryItem({ item, onUndo }: ItemProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const locale: SupportedLocale = useLocale();
    const undone: boolean = item.status === 'undone';
    return (
        <li className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className={cn('flex min-w-0 flex-col gap-0.5', undone && 'text-content-subtle line-through')}>
                <span className="truncate font-mono text-xs font-semibold">{item.fileName}</span>
                <span className="text-xs">
                    {formatIsoDate(item.createdAt, locale)} · {t('history.operations', { count: item.operations })}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Badge tone={undone ? 'neutral' : 'positive'}>{t(`history.status.${item.status}`)}</Badge>
                {undone ? null : (
                    <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t('undo.buttonFor', { file: item.fileName })}
                        onClick={(): void => {
                            onUndo(item);
                        }}
                    >
                        {t('undo.button')}
                    </Button>
                )}
            </div>
        </li>
    );
}

function HistoryList({ data, onUndo }: { readonly data: InvestmentImportList; readonly onUndo: ItemProps['onUndo'] }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    if (data.data.length === 0) {
        return <p className="text-sm text-content-muted">{t('history.empty')}</p>;
    }
    return (
        <ul aria-label={t('history.label')} className="flex flex-col divide-y divide-border">
            {data.data.map((item: InvestmentImportView): ReactElement => (
                <HistoryItem key={item.id} item={item} onUndo={onUndo} />
            ))}
        </ul>
    );
}

export function InvestmentImportHistory(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const [page, setPage] = useState<number>(1);
    const [undoing, setUndoing] = useState<InvestmentImportView | null>(null);
    const imports: UseQueryResult<InvestmentImportList> = useInvestmentImports(page);
    if (imports.isError) {
        return <Alert title={t('history.loadFailed')} />;
    }
    if (imports.data === undefined) {
        return (
            <Loading label={t('history.label')}>
                <Skeleton className="h-16 w-full" />
            </Loading>
        );
    }
    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-content">{t('history.title')}</h3>
            <HistoryList data={imports.data} onUndo={setUndoing} />
            <Pager page={page} totalPages={imports.data.pagination.totalPages} onChange={setPage} />
            {undoing === null ? null : (
                <UndoInvestmentImportDialog
                    item={undoing}
                    onClose={(): void => {
                        setUndoing(null);
                    }}
                />
            )}
        </section>
    );
}
