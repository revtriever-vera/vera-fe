import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatIsoDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Money } from '@/shared/ui/money';
import { formatShareBps } from '../../lib/format-bps';
import type { TitleDetail, TitleValuation } from '../types';

function Row({ label, children }: { readonly label: string; readonly children: ReactElement | string }): ReactElement {
    return (
        <div className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="text-content-muted">{label}</dt>
            <dd className="numeric font-semibold text-content">{children}</dd>
        </div>
    );
}

function Taxes({ valuation }: { readonly valuation: TitleValuation }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    return (
        <>
            <Row label={t('detail.tax')}>
                {valuation.taxRegime === 'exempt' ? (
                    t('detail.taxExempt')
                ) : (
                    <Money amountMinor={valuation.taxEstimatedMinor} currency={valuation.currency} />
                )}
            </Row>
            <Row label={t('detail.net')}>
                <Money amountMinor={valuation.netEstimatedMinor} currency={valuation.currency} />
            </Row>
        </>
    );
}

export function FixedIncomeDetail({ title }: { readonly title: TitleDetail }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const valuation: TitleValuation = title.valuation;
    return (
        <section aria-label={t('detail.title')} className="flex flex-col gap-2 rounded-card border border-border bg-surface-muted p-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-content">{t('detail.title')}</h3>
                <Badge>{t('detail.estimatedAsOf', { date: formatIsoDate(valuation.asOf, locale) })}</Badge>
            </div>
            <dl className="flex flex-col gap-1.5">
                <Row label={t('detail.gross')}>
                    <Money amountMinor={valuation.valueMinor} currency={valuation.currency} />
                </Row>
                <Row label={t('detail.accrued')}>{formatShareBps(valuation.accruedBps, locale, 2)}</Row>
                <Taxes valuation={valuation} />
            </dl>
            <p className="text-xs text-content-muted">{t('detail.note')}</p>
        </section>
    );
}
