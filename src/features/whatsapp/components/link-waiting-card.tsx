import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button, buttonVariants } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { CopyField } from '@/shared/ui/copy-field';
import { formatClock, formatPhone } from '../lib/format-phone';
import { useCodeIssuer, type CodeIssuer } from '../lib/use-code-issuer';
import { useExpired } from '../lib/use-expired';
import type { IssuedLink } from '../types';
import { LinkQr } from './link-qr';

export interface LinkWaitingCardProps {
    readonly issued: IssuedLink | null;
    readonly expiresAt: string;
    readonly veraNumber: string | null;
    readonly onIssued: (issued: IssuedLink) => void;
}

function IssuedBody({ issued, veraNumber }: { readonly issued: IssuedLink; readonly veraNumber: string | null }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const locale: SupportedLocale = useLocale();
    return (
        <>
            <div className="grid gap-5 min-[641px]:grid-cols-2">
                <div className="flex flex-col items-start gap-2">
                    <h3 className="text-sm font-semibold text-content">{t('waiting.phoneTitle')}</h3>
                    <a
                        href={issued.waLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(): void => {
                            track('whatsapp_link_opened', { via: 'button' });
                        }}
                        className={buttonVariants({ size: 'lg' })}
                    >
                        {t('waiting.open')}
                    </a>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-content">{t('waiting.qrTitle')}</h3>
                    <LinkQr waLink={issued.waLink} />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-sm text-content">
                    {t('waiting.manual', { code: issued.code, number: veraNumber === null ? '' : formatPhone(veraNumber) })}
                </p>
                <CopyField value={issued.code} copyLabel={t('waiting.copyCode')} />
                <p className="text-xs text-content-muted">{t('waiting.validUntil', { time: formatClock(issued.expiresAt, locale) })}</p>
            </div>
        </>
    );
}

function AnotherCode({ issuer, message }: { readonly issuer: CodeIssuer; readonly message: string }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    return (
        <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-content">{message}</p>
            <Button
                variant="secondary"
                loading={issuer.pending}
                onClick={(): void => {
                    issuer.issue(false);
                }}
            >
                {t('waiting.another')}
            </Button>
        </div>
    );
}

export function LinkWaitingCard({ issued, expiresAt, veraNumber, onIssued }: LinkWaitingCardProps): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const locale: SupportedLocale = useLocale();
    const expired: boolean = useExpired(expiresAt);
    const issuer: CodeIssuer = useCodeIssuer(onIssued);
    return (
        <Card className="flex flex-col gap-4" aria-live="polite">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-content">{t('waiting.title')}</h2>
                <p className="text-sm text-content-muted">{t('waiting.description')}</p>
            </div>
            {expired ? <AnotherCode issuer={issuer} message={t('waiting.expired')} /> : null}
            {!expired && issued !== null ? <IssuedBody issued={issued} veraNumber={veraNumber} /> : null}
            {!expired && issued === null ? (
                <AnotherCode issuer={issuer} message={t('waiting.pendingNoLink', { time: formatClock(expiresAt, locale) })} />
            ) : null}
        </Card>
    );
}
