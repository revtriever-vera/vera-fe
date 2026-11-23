import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { TotpCodeForm, type TotpCodeKind } from './totp-code-form';

export interface AdminTotpChallengeProps {
    readonly pending: boolean;
    readonly onSubmit: (code: string) => void;
    readonly onRestart: () => void;
}

export function AdminTotpChallenge({ pending, onSubmit, onRestart }: AdminTotpChallengeProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const [kind, setKind] = useState<TotpCodeKind>('authenticator');
    const isRecovery: boolean = kind === 'recovery';

    return (
        <>
            <h1 className="mt-9 mb-1.5 text-3xl font-extrabold tracking-tight">{t('totpChallengeTitle')}</h1>
            <p className="mb-6 text-content-muted">{t('totpChallengeSubtitle')}</p>
            <TotpCodeForm
                key={kind}
                kind={kind}
                submitLabel={t('totpVerify')}
                busyLabel={t('totpVerifying')}
                pending={pending}
                onSubmit={onSubmit}
            />
            <div className="mt-3 flex flex-col gap-1">
                <Button
                    variant="ghost"
                    block
                    onClick={(): void => {
                        setKind(isRecovery ? 'authenticator' : 'recovery');
                    }}
                >
                    {isRecovery ? t('totpUseAuthenticator') : t('totpUseRecovery')}
                </Button>
                <Button variant="ghost" block onClick={onRestart}>
                    {t('totpRestart')}
                </Button>
            </div>
        </>
    );
}
