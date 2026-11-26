import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { ConcentrationCard } from '../../concentration/components/concentration-card';
import { ConcentrationRow } from '../../concentration/components/concentration-row';
import { sectorLabel } from '../../concentration/lib/bucket-label';
import { reviewIssuerLabel } from '../lib/issuer-name';
import type { FgcGroup, IssuerRow, MonthlyReview, SectorRow } from '../types';

function FgcNote({ review }: { readonly review: MonthlyReview }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const locale: SupportedLocale = useLocale();
    const { overLimitMinor, groups }: MonthlyReview['concentration']['fgcExposure'] = review.concentration.fgcExposure;
    const money: (minor: number) => string = (minor: number): string => formatCurrency(minor, review.baseCurrency, locale);
    if (overLimitMinor <= 0) {
        return <p className="text-sm text-content-muted">{t('concentration.fgcClear')}</p>;
    }
    return (
        <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">{t('concentration.fgcOver', { amount: money(overLimitMinor) })}</p>
            <ul className="flex flex-col">
                {groups.map((group: FgcGroup): ReactElement => (
                    <li key={group.groupId} className="break-words text-sm text-content-muted">
                        {t('concentration.fgcGroup', { name: group.groupName, amount: money(group.overMinor) })}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function IssuersCard({ review }: { readonly review: MonthlyReview }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const { t: tPortfolio }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const rows: MonthlyReview['concentration']['topIssuers'] = review.concentration.topIssuers;
    const max: number = Math.max(0, ...rows.map((row: IssuerRow): number => row.valueMinor));
    return (
        <ConcentrationCard title={t('concentration.issuers')} description={t('concentration.issuersDescription')}>
            <ul className="flex flex-col">
                {rows.map((row: IssuerRow): ReactElement => (
                    <ConcentrationRow
                        key={row.key}
                        label={reviewIssuerLabel(tPortfolio, row)}
                        detail=""
                        valueMinor={row.valueMinor}
                        shareBps={row.shareBps}
                        maxMinor={max}
                        currency={review.baseCurrency}
                    />
                ))}
            </ul>
            <FgcNote review={review} />
        </ConcentrationCard>
    );
}

function SectorsCard({ review }: { readonly review: MonthlyReview }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const { t: tPortfolio }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const rows: MonthlyReview['concentration']['sectors'] = review.concentration.sectors;
    const max: number = Math.max(0, ...rows.map((row: SectorRow): number => row.valueMinor));
    return (
        <ConcentrationCard title={t('concentration.sectors')} description={t('concentration.sectorsDescription')}>
            {rows.length === 0 ? <p className="text-sm text-content-muted">{t('concentration.sectorsEmpty')}</p> : null}
            <ul className="flex flex-col">
                {rows.map((row: SectorRow): ReactElement => (
                    <ConcentrationRow
                        key={row.key}
                        label={sectorLabel(tPortfolio, row.key)}
                        detail=""
                        valueMinor={row.valueMinor}
                        shareBps={row.shareBps}
                        maxMinor={max}
                        currency={review.baseCurrency}
                    />
                ))}
            </ul>
        </ConcentrationCard>
    );
}

export function ConcentrationSection({ review }: { readonly review: MonthlyReview }): ReactElement {
    return (
        <div className="grid items-start gap-4 min-[861px]:grid-cols-2">
            <IssuersCard review={review} />
            <SectorsCard review={review} />
        </div>
    );
}
