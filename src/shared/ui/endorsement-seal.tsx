import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

export const REVTRIEVER_URL: string = 'https://revtriever.com';

export interface EndorsementSealProps {
    readonly className?: string;
}

function RevtrieverMark(): ReactElement {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="flex-none">
            <path d="M5 4h8a5 5 0 0 1 1.6 9.7L19 20h-3.2l-4-6H8v6H5z M8 7v4h5a2 2 0 0 0 0-4z" fill="currentColor" fillRule="evenodd" />
        </svg>
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
                <RevtrieverMark />
                {t('endorsementSeal')}
            </a>
        </p>
    );
}
