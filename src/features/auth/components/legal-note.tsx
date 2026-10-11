import type { ReactElement, ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { env } from '@/shared/config/env';

function LegalLink({ href, children }: { readonly href: string; readonly children?: ReactNode }): ReactElement {
    if (href === '') {
        return <span>{children}</span>;
    }
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-content underline underline-offset-2">
            {children}
        </a>
    );
}

export function LegalNote(): ReactElement {
    return (
        <p className="mt-5 text-xs leading-normal text-content-muted">
            <Trans
                i18nKey="legalNote"
                ns="auth"
                components={{
                    terms: <LegalLink href={env.VITE_TERMS_URL} />,
                    privacy: <LegalLink href={env.VITE_PRIVACY_URL} />
                }}
            />
        </p>
    );
}
