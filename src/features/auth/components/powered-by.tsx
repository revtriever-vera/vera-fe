import type { ReactElement } from 'react';
import { Trans } from 'react-i18next';
import revtrieverMark from '../assets/revtriever-mark.svg';

const WORDMARK: { readonly lead: string; readonly tail: string } = { lead: 'Rev', tail: 'triever' } as const;

function RevtrieverWordmark(): ReactElement {
    return (
        <span className="ml-1 inline-flex items-center gap-1.5 align-middle">
            <img src={revtrieverMark} alt="" width={18} height={18} className="block size-[18px]" />
            <span className="font-extrabold tracking-[-0.01em] text-content">
                {WORDMARK.lead}
                <em className="text-partner not-italic">{WORDMARK.tail}</em>
            </span>
        </span>
    );
}

export function PoweredBy(): ReactElement {
    return (
        <p className="mt-7 text-center text-xs tracking-wide text-content-muted min-[861px]:absolute min-[861px]:inset-x-0 min-[861px]:bottom-5 min-[861px]:mt-0">
            <Trans i18nKey="poweredBy" ns="auth" components={{ brand: <RevtrieverWordmark /> }} />
        </p>
    );
}
