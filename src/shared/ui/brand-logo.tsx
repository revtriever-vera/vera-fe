import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';

export function BrandLogo(): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    return (
        <span className="flex items-center gap-2.5">
            <span className="grid size-9 flex-none place-items-center rounded-md bg-accent text-accent-contrast shadow-card">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M4.8 6 L12 19.2 L19.2 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle cx="12" cy="8.6" r="2.2" fill="currentColor" />
                </svg>
            </span>
            <b className="font-display text-[25px] leading-[0.9] font-bold tracking-[-0.045em] after:text-accent after:content-['.']">
                {t('brandName')}
            </b>
        </span>
    );
}
