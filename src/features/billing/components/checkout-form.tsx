import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { SegmentedControl, type SegmentedOption } from '@/shared/ui/segmented-control';
import { billingErrorMessage } from '../lib/billing-error-message';
import { priceText } from '../lib/billing-format';
import type { BillingMe, CheckoutMethod } from '../types';

export function CheckoutSummary({ me }: { readonly me: BillingMe }): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="flex flex-col gap-2 rounded-card bg-surface-muted p-4">
            <span className="text-sm font-semibold text-content">{t('checkout.summary.label')}</span>
            <span className="text-2xl font-semibold text-content tabular-nums">
                {priceText(me, locale)} <span className="text-sm font-normal text-content-muted">{t('checkout.summary.perMonth')}</span>
            </span>
            <ul className="m-0 flex list-disc flex-col gap-1 pl-4 text-sm text-content-muted">
                <li>{t('planTab.cards.premiumText')}</li>
                <li>{t('checkout.summary.quota')}</li>
            </ul>
            <p className="m-0 text-xs text-content-muted">{t('checkout.summary.cancelNote')}</p>
        </div>
    );
}

export interface MethodFormProps {
    readonly me: BillingMe;
    readonly method: CheckoutMethod;
    readonly onMethod: (method: CheckoutMethod) => void;
    readonly error: Error | null;
}

export function MethodForm({ me, method, onMethod, error }: MethodFormProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const offered: ReadonlySet<CheckoutMethod> = new Set<CheckoutMethod>(me.methods);
    const all: readonly SegmentedOption<CheckoutMethod>[] = [
        { value: 'pix', label: 'Pix' },
        { value: 'card', label: t('checkout.card') }
    ];
    const options: readonly SegmentedOption<CheckoutMethod>[] = all.filter((option: SegmentedOption<CheckoutMethod>): boolean =>
        offered.has(option.value)
    );
    return (
        <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-content">{t('checkout.method')}</span>
            {options.length > 1 ? (
                <SegmentedControl label={t('checkout.method')} options={options} value={method} onChange={onMethod} />
            ) : null}
            <p className="m-0 text-sm text-content-muted">{t(method === 'pix' ? 'checkout.pixHint' : 'checkout.cardHint')}</p>
            <p className="m-0 text-xs text-content-muted">{t(method === 'pix' ? 'checkout.pixPrivacy' : 'checkout.cardPrivacy')}</p>
            <p className="m-0 text-xs text-content-muted">{t('checkout.processed')}</p>
            {error === null ? null : <Alert title={billingErrorMessage(t, error)} />}
        </div>
    );
}
