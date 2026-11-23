import { Check, Copy, Download } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { downloadTextFile } from '../lib/download-text-file';

const RECOVERY_FILE_NAME: string = 'vera-admin-recovery-codes.txt';

export interface AdminRecoveryCodesProps {
    readonly codes: readonly string[];
    readonly onSaved: () => void;
}

function RecoveryActions({ text }: { readonly text: string }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const [copied, setCopied] = useState<boolean>(false);

    const copy = async (): Promise<void> => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
    };

    return (
        <div className="mb-5 grid grid-cols-2 gap-2">
            <Button
                variant="secondary"
                onClick={(): void => {
                    void copy();
                }}
            >
                {copied ? <Check className="size-4 text-positive" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? t('totpRecoveryCopied') : t('totpRecoveryCopy')}
            </Button>
            <Button
                variant="secondary"
                onClick={(): void => {
                    downloadTextFile(RECOVERY_FILE_NAME, text);
                }}
            >
                <Download className="size-4" aria-hidden="true" />
                {t('totpRecoveryDownload')}
            </Button>
        </div>
    );
}

export function AdminRecoveryCodes({ codes, onSaved }: AdminRecoveryCodesProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const text: string = codes.join('\n');

    return (
        <>
            <h1 className="mt-9 mb-1.5 text-3xl font-extrabold tracking-tight">{t('totpRecoveryTitle')}</h1>
            <p className="mb-6 text-content-muted">{t('totpRecoverySubtitle')}</p>
            <ul
                aria-label={t('totpRecoveryListLabel')}
                className="mb-4 grid grid-cols-2 gap-2 rounded-card border border-border bg-surface-muted p-4 font-mono text-sm text-content"
            >
                {codes.map((code: string): ReactElement => (
                    <li key={code}>{code}</li>
                ))}
            </ul>
            <RecoveryActions text={text} />
            <Button block onClick={onSaved}>
                {t('totpRecoverySaved')}
            </Button>
        </>
    );
}
