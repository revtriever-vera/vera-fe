import { useId, useState, type ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { useCodeIssuer, type CodeIssuer } from '../lib/use-code-issuer';
import type { IssuedLink } from '../types';

const PRIVACY_PARAMS: { readonly tab: string } = { tab: 'privacy' };

export interface LinkStartCardProps {
    readonly consentRequired: boolean;
    readonly onIssued: (issued: IssuedLink) => void;
}

function ConsentBox({ checked, onChange }: { readonly checked: boolean; readonly onChange: (value: boolean) => void }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const id: string = useId();
    return (
        <div className="flex flex-col gap-2 rounded-card border border-border bg-surface-muted p-3">
            <div className="flex items-start gap-2.5">
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={(event): void => {
                        onChange(event.target.checked);
                    }}
                    className="mt-0.5 size-4 shrink-0 accent-accent-strong"
                />
                <label htmlFor={id} className="text-sm text-content">
                    {t('start.consent')}
                </label>
            </div>
            <Link to="/settings/$tab" params={PRIVACY_PARAMS} className="self-start text-sm font-semibold text-accent-strong underline">
                {t('start.seeSent')}
            </Link>
        </div>
    );
}

export function LinkStartCard({ consentRequired, onIssued }: LinkStartCardProps): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const [consent, setConsent] = useState<boolean>(false);
    const issuer: CodeIssuer = useCodeIssuer(onIssued);
    return (
        <Card className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-content">{t('start.title')}</h2>
                <p className="text-sm text-content-muted">{t('start.description')}</p>
            </div>
            {consentRequired ? <ConsentBox checked={consent} onChange={setConsent} /> : null}
            <Button
                className="self-start"
                loading={issuer.pending}
                disabled={consentRequired && !consent}
                onClick={(): void => {
                    issuer.issue(consentRequired && consent);
                }}
            >
                {t('start.generate')}
            </Button>
        </Card>
    );
}
