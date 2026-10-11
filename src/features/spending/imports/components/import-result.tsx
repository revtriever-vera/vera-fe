import type { ReactElement } from 'react';
import { CircleCheck } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { ImportCreated } from '../../types';
import { rejectionsText, resultCounts, type ResultCounts } from '../lib/import-summary-text';

export function ImportResult({ created }: { readonly created: ImportCreated }): ReactElement {
    const { t }: UseTranslationResponse<'spendingImports', undefined> = useTranslation('spendingImports');
    const locale: SupportedLocale = useLocale();
    const counts: ResultCounts = resultCounts(t, created);
    return (
        <div role="status" className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-positive">
                <CircleCheck className="size-5" aria-hidden="true" />
                <h3 className="text-base font-semibold">{t('result.title')}</h3>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-content">
                <li className="font-semibold">{counts.inserted}</li>
                <li>
                    {counts.duplicates}
                    {created.duplicates > 0 ? <span className="block text-content-muted">{t('result.duplicatesWhy')}</span> : null}
                </li>
                <li>
                    {counts.rejected}
                    {created.rejected > 0 ? (
                        <span className="block text-content-muted">{rejectionsText(t, locale, created.rejected, created.rejections)}</span>
                    ) : null}
                </li>
            </ul>
        </div>
    );
}
