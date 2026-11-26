import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { formatReturnPct } from '../lib/format-return';
import type { MonthlyReview, PriceMove } from '../types';

interface MoveListProps {
    readonly title: string;
    readonly moves: readonly PriceMove[];
}

function MoveList({ title, moves }: MoveListProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    const locale: SupportedLocale = useLocale();
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <h4 className="text-sm font-semibold text-content-muted">{title}</h4>
            {moves.length === 0 ? (
                <p className="text-sm text-content-muted">{t('moves.none')}</p>
            ) : (
                <ul className="flex flex-col divide-y divide-border">
                    {moves.map((move: PriceMove): ReactElement => (
                        <li key={move.assetId} className="flex items-center justify-between gap-3 py-2">
                            <span className="min-w-0 break-words text-sm font-semibold">{move.symbol}</span>
                            <span className="numeric text-sm font-semibold">{formatReturnPct(move.variationPct, locale)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function MovesSection({ review }: { readonly review: MonthlyReview }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioReview', undefined> = useTranslation('portfolioReview');
    if (review.topGainers.length === 0 && review.topLosers.length === 0) {
        return null;
    }
    return (
        <Card className="flex flex-col gap-3">
            <div>
                <h3 className="text-base font-semibold">{t('moves.title')}</h3>
                <p className="text-sm text-content-muted">{t('moves.description')}</p>
            </div>
            <div className="grid gap-4 min-[861px]:grid-cols-2">
                <MoveList title={t('moves.gainers')} moves={review.topGainers} />
                <MoveList title={t('moves.losers')} moves={review.topLosers} />
            </div>
        </Card>
    );
}
