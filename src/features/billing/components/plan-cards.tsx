import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { priceText } from '../lib/billing-format';
import type { BillingMe } from '../types';

export interface PlanCardsProps {
    readonly me: BillingMe;
    readonly onSubscribe: () => void;
}

export function PlanCards({ me, onSubscribe }: PlanCardsProps): ReactElement {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const locale: SupportedLocale = useLocale();
    const canSubscribe: boolean = me.canManage && me.methods.length > 0;
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <section
                aria-label={t('planTab.cards.freeLabel')}
                className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4"
            >
                <h3 className="m-0 text-base font-semibold text-content">{t('planTab.cards.freeLabel')}</h3>
                <p className="m-0 text-lg font-semibold text-content">{priceText({ ...me, priceCents: 0 }, locale)}</p>
                <p className="m-0 text-sm text-content-muted">{t('planTab.cards.freeText')}</p>
                <div className="mt-auto pt-2">
                    <Badge>{t('planTab.cards.current')}</Badge>
                </div>
            </section>
            <section
                aria-label={t('planTab.cards.premiumLabel')}
                className="flex flex-col gap-2 rounded-card border border-accent bg-surface p-4"
            >
                <h3 className="m-0 text-base font-semibold text-content">{t('planTab.cards.premiumLabel')}</h3>
                <p className="m-0 text-lg font-semibold text-content">
                    {priceText(me, locale)}
                    <span className="text-sm font-normal text-content-muted">{t('planTab.cards.perMonth')}</span>
                </p>
                <p className="m-0 text-sm text-content-muted">{t('planTab.cards.premiumText')}</p>
                <div className="mt-auto flex flex-col items-start gap-2 pt-2">
                    {canSubscribe ? <Button onClick={onSubscribe}>{t('planTab.cards.subscribe')}</Button> : null}
                    {canSubscribe ? <span className="text-xs text-content-muted">{t('planTab.cards.hint')}</span> : null}
                    {me.canManage ? null : <span className="text-xs text-content-muted">{t('planTab.ownerOnly')}</span>}
                </div>
            </section>
        </div>
    );
}
