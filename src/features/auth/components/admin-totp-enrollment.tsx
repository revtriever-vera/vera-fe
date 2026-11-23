import { QRCodeSVG } from 'qrcode.react';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { CopyField } from '@/shared/ui/copy-field';
import type { TotpEnrollment } from '../types';
import { TotpCodeForm } from './totp-code-form';

const QR_SIZE: number = 176;

export interface AdminTotpEnrollmentProps {
    readonly enrollment: TotpEnrollment;
    readonly pending: boolean;
    readonly onSubmit: (code: string) => void;
    readonly onRestart: () => void;
}

export function AdminTotpEnrollment({ enrollment, pending, onSubmit, onRestart }: AdminTotpEnrollmentProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');

    return (
        <>
            <h1 className="mt-9 mb-1.5 text-3xl font-extrabold tracking-tight">{t('totpEnrollTitle')}</h1>
            <p className="mb-6 text-content-muted">{t('totpEnrollSubtitle')}</p>
            <div className="mb-4 flex justify-center rounded-card border border-border bg-white p-3">
                <QRCodeSVG value={enrollment.otpauthUri} size={QR_SIZE} role="img" aria-label={t('totpQrLabel')} />
            </div>
            <p className="mb-1.5 text-sm font-medium text-content">{t('totpSecretLabel')}</p>
            <CopyField value={enrollment.secret} copyLabel={t('totpSecretCopy')} className="mb-5" />
            <TotpCodeForm
                kind="authenticator"
                submitLabel={t('totpActivate')}
                busyLabel={t('totpActivating')}
                pending={pending}
                onSubmit={onSubmit}
            />
            <Button variant="ghost" block className="mt-3" onClick={onRestart}>
                {t('totpRestart')}
            </Button>
        </>
    );
}
