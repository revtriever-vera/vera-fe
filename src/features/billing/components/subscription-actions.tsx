import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { useSubscriptionActions, type SubscriptionActions } from '../lib/use-subscription-actions';
import type { BillingSubscription } from '../types';
import { CancelSubscriptionDialog } from './cancel-subscription-dialog';

function ResumeButton({ actions }: { readonly actions: SubscriptionActions }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    return (
        <Button variant="secondary" loading={actions.resuming} disabled={actions.resuming} onClick={actions.resume}>
            {actions.resuming ? t('planTab.subscription.resuming') : t('planTab.subscription.resume')}
        </Button>
    );
}

export function SubscriptionButtons({ subscription }: { readonly subscription: BillingSubscription }): ReactElement | null {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const [confirming, setConfirming] = useState<boolean>(false);
    const actions: SubscriptionActions = useSubscriptionActions();
    const close = (): void => {
        setConfirming(false);
    };
    if (subscription.status === 'canceled') {
        return subscription.canResume ? (
            <div className="border-t border-border pt-3">
                <ResumeButton actions={actions} />
            </div>
        ) : null;
    }
    return (
        <div className="border-t border-border pt-3">
            <Button
                variant="secondary"
                onClick={(): void => {
                    setConfirming(true);
                }}
            >
                {t('planTab.subscription.cancel')}
            </Button>
            {confirming ? (
                <CancelSubscriptionDialog
                    subscription={subscription}
                    pending={actions.canceling}
                    onConfirm={(): void => {
                        actions.cancel(close);
                    }}
                    onClose={close}
                />
            ) : null}
        </div>
    );
}
