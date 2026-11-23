import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { assetsDetail, sectorLabel } from '../lib/bucket-label';
import type { ConcentrationResponse, SectorRow } from '../types';
import { ConcentrationCard } from './concentration-card';
import { ConcentrationRow } from './concentration-row';

export interface SectorCardProps {
    readonly data: ConcentrationResponse;
}

export function SectorCard({ data }: SectorCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const locale: SupportedLocale = useLocale();
    const total: string = formatCurrency(data.equityTotalMinor, data.baseCurrency, locale);
    const maxMinor: number = Math.max(0, ...data.bySector.map((row: SectorRow): number => row.valueMinor));
    return (
        <ConcentrationCard
            title={t('concentration.sector.title')}
            description={t('concentration.sector.description', { total })}
            note={data.bySector.length === 0 ? undefined : t('concentration.sector.note')}
        >
            {data.bySector.length === 0 ? (
                <p className="text-sm text-content-muted">{t('concentration.sector.empty')}</p>
            ) : (
                <ul className="flex flex-col">
                    {data.bySector.map((row: SectorRow): ReactElement => (
                        <ConcentrationRow
                            key={row.key}
                            label={sectorLabel(t, row.key)}
                            detail={assetsDetail(t, row.assets, row.moreCount)}
                            valueMinor={row.valueMinor}
                            shareBps={row.shareBps}
                            maxMinor={maxMinor}
                            currency={data.baseCurrency}
                        />
                    ))}
                </ul>
            )}
        </ConcentrationCard>
    );
}
