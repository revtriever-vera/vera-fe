import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { longDate } from '../lib/billing-format';
import { REFUND_BUSINESS_DAYS, type BillingSubscription } from '../types';

export interface CancelSubscriptionDialogProps {
    readonly subscription: BillingSubscription;
    readonly pending: boolean;
    readonly onConfirm: () => void;
    readonly onClose: () => void;
}

export function isWithinWithdrawal(subscription: BillingSubscription, now: number): boolean {
    return subscription.withdrawalEndsAt !== null && new Date(subscription.withdrawalEndsAt).getTime() > now;
}

export function CancelSubscriptionDialog({ subscription, pending, onConfirm, onClose }: CancelSubscriptionDialogProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const until: string | null = subscription.paidThrough;
    const [now] = useState<number>((): number => Date.now());
    const withdrawal: boolean = isWithinWithdrawal(subscription, now);
    return (
        <Modal
            title={t('cancelDialog.title')}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t('cancelDialog.keep')}
                    </Button>
                    <Button variant="danger" loading={pending} disabled={pending} onClick={onConfirm}>
                        {t('cancelDialog.confirm')}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-3 text-sm text-content">
                <p className="m-0">
                    {until === null ? t('cancelDialog.introNoDate') : t('cancelDialog.intro', { date: longDate(until, locale) })}
                </p>
                <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-content-muted">
                    <li>{t('cancelDialog.item1')}</li>
                    <li>{t('cancelDialog.item2')}</li>
                    <li>{t('cancelDialog.item3')}</li>
                </ul>
                {withdrawal ? <p className="m-0 font-semibold">{t('cancelDialog.withdrawal', { days: REFUND_BUSINESS_DAYS })}</p> : null}
            </div>
        </Modal>
    );
}
