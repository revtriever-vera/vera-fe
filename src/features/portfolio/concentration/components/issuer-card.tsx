import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { assetsDetail, issuerLabel } from '../lib/bucket-label';
import type { ConcentrationResponse, IssuerRow } from '../types';
import { ConcentrationCard } from './concentration-card';
import { ConcentrationRow } from './concentration-row';

export interface IssuerCardProps {
    readonly data: ConcentrationResponse;
}

export function IssuerCard({ data }: IssuerCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const others: ConcentrationResponse['byIssuerOthers'] = data.byIssuerOthers;
    const maxMinor: number = Math.max(0, ...data.byIssuer.map((row: IssuerRow): number => row.valueMinor), others?.valueMinor ?? 0);
    return (
        <ConcentrationCard
            title={t('concentration.issuer.title')}
            description={t('concentration.issuer.description')}
            note={t('concentration.issuer.note')}
        >
            <ul className="flex flex-col">
                {data.byIssuer.map((row: IssuerRow): ReactElement => (
                    <ConcentrationRow
                        key={`${row.kind}:${row.key}`}
                        label={issuerLabel(t, row)}
                        detail={assetsDetail(t, row.assets, row.moreCount)}
                        valueMinor={row.valueMinor}
                        shareBps={row.shareBps}
                        maxMinor={maxMinor}
                        currency={data.baseCurrency}
                    />
                ))}
                {others === null ? null : (
                    <ConcentrationRow
                        label={t('concentration.others', { count: others.groups })}
                        detail=""
                        valueMinor={others.valueMinor}
                        shareBps={others.shareBps}
                        maxMinor={maxMinor}
                        currency={data.baseCurrency}
                    />
                )}
            </ul>
        </ConcentrationCard>
    );
}
