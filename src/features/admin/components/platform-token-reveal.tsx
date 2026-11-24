import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { env } from '@/shared/config/env';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { CopyField } from '@/shared/ui/copy-field';
import { Modal } from '@/shared/ui/modal';
import { mcpAddCommand } from '../lib/platform-token-command';
import type { CreatedPlatformToken } from '../types';

export interface PlatformTokenRevealProps {
    readonly token: CreatedPlatformToken;
    readonly onClose: () => void;
}

export function PlatformTokenReveal({ token, onClose }: PlatformTokenRevealProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <Modal
            title={t('tokenRevealTitle')}
            description={t('tokenRevealDescription', { name: token.name })}
            size="wide"
            onClose={onClose}
            footer={<Button onClick={onClose}>{t('tokenRevealDone')}</Button>}
        >
            <div className="flex flex-col gap-4">
                <Alert tone="caution" title={t('tokenRevealWarning')} />
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{t('tokenRevealTokenLabel')}</span>
                    <CopyField value={token.token} copyLabel={t('tokenRevealCopyToken')} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{t('tokenRevealCommandLabel')}</span>
                    <CopyField value={mcpAddCommand(env.VITE_API_URL, token.token)} copyLabel={t('tokenRevealCopyCommand')} />
                    <p className="text-xs text-content-muted">{t('tokenRevealCommandHint')}</p>
                </div>
            </div>
        </Modal>
    );
}
