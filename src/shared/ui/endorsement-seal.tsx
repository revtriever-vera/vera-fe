import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import revtrieverMark from '@/assets/brand/revtriever-mark.svg';
import { cn } from '@/shared/lib/cn';

export const REVTRIEVER_URL: string = 'https://revtriever.com';
const NAME_START: string = 'Rev';
const NAME_ACCENT: string = 'triever';

export interface EndorsementSealProps {
    readonly className?: string;
}

function RevtrieverName(): ReactElement {
    return (
        <span className="font-bold tracking-tight text-content">
            {NAME_START}
            <span className="text-revtriever">{NAME_ACCENT}</span>
        </span>
    );
}

export function EndorsementSeal({ className }: EndorsementSealProps): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    return (
        <p className={cn('m-0 text-center text-xs tracking-wide text-content-muted', className)}>
            <a
                href={REVTRIEVER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm font-semibold text-content-muted hover:text-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
                {t('endorsementSeal')} <img src={revtrieverMark} alt="" width={16} height={16} className="size-4 flex-none" />
                <RevtrieverName />
            </a>
        </p>
    );
}
