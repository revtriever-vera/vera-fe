import { useEffect, type ReactElement } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';

const QR_SIZE: number = 176;
const QR_BACKGROUND: string = 'transparent';
const QR_FOREGROUND: string = 'currentColor';

export function LinkQr({ waLink }: { readonly waLink: string }): ReactElement {
    const { t }: UseTranslationResponse<'whatsapp', undefined> = useTranslation('whatsapp');
    useEffect((): void => {
        track('whatsapp_link_opened', { via: 'qr' });
    }, [waLink]);
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="rounded-card bg-white p-3 text-black">
                <QRCodeSVG value={waLink} size={QR_SIZE} bgColor={QR_BACKGROUND} fgColor={QR_FOREGROUND} title={t('waiting.qrLabel')} />
            </div>
            <p className="text-sm text-content-muted">{t('waiting.qrHint')}</p>
        </div>
    );
}
