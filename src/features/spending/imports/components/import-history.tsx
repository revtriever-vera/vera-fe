import { useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import { formatIsoDate } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';
import { cn } from '@/shared/lib/cn';
import { Alert } from '@/shared/ui/alert';
import { Badge, type BadgeProps } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Pager } from '@/shared/ui/pager';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import type { ImportStatus, ImportView, ImportsResponse } from '../../types';
import { useImports } from '../api/use-imports.query';
import { historyCountsText } from '../lib/import-summary-text';
import { UndoImportDialog } from './undo-import-dialog';

const STATUS_TONES: Readonly<Record<ImportStatus, NonNullable<BadgeProps['tone']>>> = {
    processing: 'neutral',
    completed: 'positive',
    undone: 'neutral',
    failed: 'critical'
};

interface HistoryItemProps {
    readonly item: ImportView;
    readonly onUndo: (item: ImportView) => void;
}

function HistoryItem({ item, onUndo }: HistoryItemProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const locale: SupportedLocale = useLocale();
    const undone: boolean = item.status === 'undone';
    return (
        <li className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className={cn('flex min-w-0 flex-col gap-0.5', undone && 'text-content-subtle line-through')}>
                <span className="truncate font-mono text-xs font-semibold">{item.fileName}</span>
                <span className="text-xs">
                    {item.accountName} · {formatIsoDate(item.createdAt, locale)} · {historyCountsText(t, item)}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONES[item.status]}>{t(`history.status.${item.status}`)}</Badge>
                {item.status === 'completed' ? (
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
                ) : null}
            </div>
        </li>
    );
}

function HistoryList({ data, onUndo }: { readonly data: ImportsResponse; readonly onUndo: (item: ImportView) => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    if (data.data.length === 0) {
        return <p className="text-sm text-content-muted">{t('history.empty')}</p>;
    }
    return (
        <ul aria-label={t('history.label')} className="flex flex-col divide-y divide-border">
            {data.data.map((item: ImportView): ReactElement => (
                <HistoryItem key={item.id} item={item} onUndo={onUndo} />
            ))}
        </ul>
    );
}

export function ImportHistory(): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const [page, setPage] = useState<number>(1);
    const [undoing, setUndoing] = useState<ImportView | null>(null);
    const imports: UseQueryResult<ImportsResponse> = useImports(page);
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
        <div className="flex flex-col gap-3">
            <HistoryList data={imports.data} onUndo={setUndoing} />
            <Pager page={page} totalPages={imports.data.pagination.totalPages} onChange={setPage} />
            {undoing === null ? null : (
                <UndoImportDialog
                    item={undoing}
                    onClose={(): void => {
                        setUndoing(null);
                    }}
                />
            )}
        </div>
    );
}
