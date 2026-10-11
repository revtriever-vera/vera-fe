import type { ReactElement } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';

export function TrustNotes(): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    return (
        <ul className="flex flex-col gap-2 text-sm text-content-muted">
            <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden="true" />
                <span>{t('trust.openSource')}</span>
            </li>
            <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden="true" />
                <span>{t('trust.privacy')}</span>
            </li>
        </ul>
    );
}
