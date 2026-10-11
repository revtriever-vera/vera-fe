import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';

const LINK_CLASS: string = 'font-semibold text-accent-strong underline underline-offset-2';

export function ImportStatementLink({ link }: { readonly link: string | null }): ReactElement | null {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');

    if (link === null) {
        return null;
    }
    return (
        <p className="mt-4 text-sm text-content-muted">
            {t('importPrompt')}{' '}
            <Link
                to={link}
                search={{ import: true }}
                className={LINK_CLASS}
                onClick={(): void => {
                    track('onboarding_import_opened');
                }}
            >
                {t('importAction')}
            </Link>
        </p>
    );
}
