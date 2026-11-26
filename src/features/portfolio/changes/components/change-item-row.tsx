import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { safeDocumentUrl } from '../../agenda/lib/safe-document-url';
import type { ChangeItem } from '../types';

const LINK_CLASS: string = 'text-sm font-semibold text-accent-strong underline underline-offset-2';

export function ChangeItemRow({ item }: { readonly item: ChangeItem }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioChanges', undefined> = useTranslation('portfolioChanges');
    const locale: SupportedLocale = useLocale();
    const document: string | null = safeDocumentUrl(item.documentUrl);
    return (
        <li className="flex flex-col gap-1.5 py-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 break-words text-sm font-semibold">{item.symbol}</span>
                <Badge>{t(`kinds.${item.kind ?? 'other'}`)}</Badge>
                <time dateTime={item.date} className="numeric text-sm text-content-muted">
                    {formatIsoDate(item.date, locale)}
                </time>
            </div>
            {item.summaryAvailable ? (
                <p className="break-words text-sm text-content">{item.summary}</p>
            ) : (
                <>
                    <p className="break-words text-sm text-content">{item.title}</p>
                    <p className="text-sm text-content-muted">{t('item.unavailable')}</p>
                </>
            )}
            {item.weightLine === null ? null : <p className="text-xs text-content-muted">{item.weightLine}</p>}
            {document === null ? null : (
                <div>
                    <a href={document} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                        {t('item.document', { symbol: item.symbol })}
                    </a>
                </div>
            )}
        </li>
    );
}
