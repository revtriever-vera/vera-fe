import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { buttonVariants } from '@/shared/ui/button';

const WHATSAPP_PARAMS: { readonly tab: string } = { tab: 'whatsapp' };
const LINK_CLASS: string = buttonVariants({ variant: 'secondary', size: 'sm' });

export function CheckoutDone({ onClose }: { readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-content">{t('checkout.done.intro')}</p>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                <div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-content">{t('checkout.done.summary')}</span>
                    <span className="text-sm text-content-muted">{t('checkout.done.summaryText')}</span>
                </div>
                <Link to="/spending" onClick={onClose} className={LINK_CLASS}>
                    {t('checkout.done.summaryAction')}
                </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                <div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-content">{t('checkout.done.whatsapp')}</span>
                    <span className="text-sm text-content-muted">{t('checkout.done.whatsappText')}</span>
                </div>
                <Link to="/settings/$tab" params={WHATSAPP_PARAMS} onClick={onClose} className={LINK_CLASS}>
                    {t('checkout.done.whatsappAction')}
                </Link>
            </div>
        </div>
    );
}
