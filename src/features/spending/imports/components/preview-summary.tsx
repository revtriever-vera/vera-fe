import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import type { ImportPreview } from '../../types';
import { formatMoment, previewSummaryText, rejectionsText } from '../lib/import-summary-text';

export interface PreviewSummaryProps {
    readonly preview: ImportPreview;
    readonly awaitingMapping: boolean;
}

export function PreviewSummary({ preview, awaitingMapping }: PreviewSummaryProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge tone="accent">{t(`formats.${preview.format}`)}</Badge>
                <span className="font-semibold text-content">
                    {awaitingMapping ? t('preview.genericFound', { count: preview.rows }) : previewSummaryText(t, preview, locale)}
                </span>
            </div>
            {awaitingMapping ? <p className="text-sm text-content-muted">{t('preview.mappingPending')}</p> : null}
            {preview.rejected > 0 ? (
                <p className="text-sm text-caution">{rejectionsText(t, locale, preview.rejected, preview.rejections)}</p>
            ) : null}
            {preview.alreadyImportedAt === null ? null : (
                <Alert tone="caution" title={t('preview.alreadyImported', { date: formatMoment(preview.alreadyImportedAt, locale) })} />
            )}
        </div>
    );
}
