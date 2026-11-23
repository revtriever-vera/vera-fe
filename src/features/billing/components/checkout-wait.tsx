import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import type { CheckoutMethod } from '../types';

export interface CheckoutWaitProps {
    readonly method: CheckoutMethod;
    readonly timedOut: boolean;
    readonly onReopen: (() => void) | null;
}

export function CheckoutWait({ method, timedOut, onReopen }: CheckoutWaitProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    return (
        <output className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-border border-t-accent" aria-hidden="true" />
            <p className="text-sm font-semibold text-content">{t('checkout.wait.text')}</p>
            {method === 'pix' ? <p className="text-sm text-content-muted">{t('checkout.pix.instruction')}</p> : null}
            {timedOut ? <p className="text-sm text-content-muted">{t('checkout.wait.slow')}</p> : null}
            {method === 'pix' && onReopen !== null ? (
                <Button variant="secondary" size="sm" onClick={onReopen}>
                    {t('checkout.pix.reopen')}
                </Button>
            ) : null}
        </output>
    );
}
