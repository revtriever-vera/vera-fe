import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { AssetsTabName } from '@/shared/lib/analytics/events';
import { isMaturity } from '../lib/agenda-filter';
import { safeDocumentUrl } from '../lib/safe-document-url';
import type { AgendaItem } from '../types';
import { useHolderParam } from '../../lib/use-holder-param';
import type { HolderParam } from '../../lib/holder-filter';

const FIXED_INCOME_TAB: AssetsTabName = 'fixed-income';
const LINK_CLASS: string = 'text-sm font-semibold text-accent-strong underline underline-offset-2';

export function AgendaItemLinks({ item }: { readonly item: AgendaItem }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioAgenda', undefined> = useTranslation('portfolioAgenda');
    const holder: HolderParam = useHolderParam();
    const document: string | null = safeDocumentUrl(item.documentUrl);
    if (document === null && !isMaturity(item.kind)) {
        return null;
    }
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
            {document === null ? null : (
                <a href={document} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                    {t('item.document', { name: item.name })}
                </a>
            )}
            {isMaturity(item.kind) ? (
                <Link to="/portfolio/assets" search={{ tab: FIXED_INCOME_TAB, holder }} className={LINK_CLASS}>
                    {t('item.fixedIncome', { name: item.name })}
                </Link>
            ) : null}
        </div>
    );
}
