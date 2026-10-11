import type { ReactElement } from 'react';
import { Info } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';

export function ZeroQuantityNote(): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <p className="flex items-start gap-2 rounded-control bg-accent-soft px-3 py-2 text-sm text-accent-strong">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t('classDetail.zeroNote')}
        </p>
    );
}
