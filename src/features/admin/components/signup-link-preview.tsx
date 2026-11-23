import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { discountedPriceCents, isCompleteRule, PREMIUM_PRICE_CENTS, PRICE_CURRENCY } from '../lib/signup-link-offer';
import type { DiscountRule } from '../types';

export interface SignupLinkPreviewProps {
    readonly rules: readonly DiscountRule[];
}

function RuleLine({ rule }: { readonly rule: DiscountRule }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const locale: SupportedLocale = useLocale();
    const price: string = formatCurrency(discountedPriceCents(rule.percent), PRICE_CURRENCY, locale);
    const values: { from: number; to: number; price: string; percent: number } = {
        from: rule.fromCycle,
        to: rule.toCycle,
        price,
        percent: rule.percent
    };
    return <li>{rule.fromCycle === rule.toCycle ? t('previewSingle', values) : t('previewRange', values)}</li>;
}

export function SignupLinkPreview({ rules }: SignupLinkPreviewProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const locale: SupportedLocale = useLocale();
    const complete: readonly DiscountRule[] = rules.filter(isCompleteRule);
    const base: string = formatCurrency(PREMIUM_PRICE_CENTS, PRICE_CURRENCY, locale);
    return (
        <aside aria-label={t('previewTitle', { price: base })} className="surface-card flex flex-col gap-2 p-4 text-sm">
            <h3 className="font-semibold">{t('previewTitle', { price: base })}</h3>
            {complete.length === 0 ? <p className="text-content-muted">{t('previewNoRules', { price: base })}</p> : null}
            {complete.length > 0 ? (
                <ul className="flex flex-col gap-1 text-content-muted">
                    {complete.map((rule: DiscountRule, index: number): ReactElement => (
                        <RuleLine key={`${String(index)}-${String(rule.fromCycle)}`} rule={rule} />
                    ))}
                    <li>{t('previewAfter', { price: base })}</li>
                </ul>
            ) : null}
        </aside>
    );
}
