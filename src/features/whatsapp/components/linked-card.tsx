import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { formatIsoDate } from '@/shared/lib/format/date';
import { formatPhone } from '../lib/format-phone';
import { LINK_STATUS, type LinkView } from '../types';
import { UnlinkDialog } from './unlink-dialog';

export interface LinkedCardProps {
    readonly view: LinkView;
    readonly onUnlinked: () => void;
}

function LinkedHeader({ view }: { readonly view: LinkView }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const locale: SupportedLocale = useLocale();
    const suspended: boolean = view.status === LINK_STATUS.suspended;
    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-content">{t('linked.title')}</h2>
                {view.linkedAt === null ? null : (
                    <p className="text-xs text-content-muted">{t('linked.since', { date: formatIsoDate(view.linkedAt, locale) })}</p>
                )}
            </div>
            <Badge tone={suspended ? 'caution' : 'positive'}>{suspended ? t('linked.suspended') : t('linked.active')}</Badge>
        </div>
    );
}

export function LinkedCard({ view, onUnlinked }: LinkedCardProps): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    const [confirming, setConfirming] = useState<boolean>(false);
    return (
        <Card className="flex flex-col gap-3">
            <LinkedHeader view={view} />
            <p className="text-lg font-semibold text-content">{view.phone === null ? '' : formatPhone(view.phone)}</p>
            {view.veraNumber === null ? null : (
                <p className="text-sm text-content-muted">{t('linked.answersFrom', { number: formatPhone(view.veraNumber) })}</p>
            )}
            <Button
                variant="secondary"
                className="self-start"
                onClick={(): void => {
                    setConfirming(true);
                }}
            >
                {t('linked.unlink')}
            </Button>
            {confirming ? (
                <UnlinkDialog
                    phone={view.phone ?? ''}
                    onClose={(): void => {
                        setConfirming(false);
                    }}
                    onUnlinked={onUnlinked}
                />
            ) : null}
        </Card>
    );
}
