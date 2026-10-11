import type { ReactElement } from 'react';
import type { Control } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import type { BaseCurrency, ClassColorKey } from '../../types';
import type { AssetTargetsFormValues } from '../schemas/asset-targets.schema';
import type { ClassDetailAsset } from '../types';
import { ClassAssetRow, ROW_GRID } from './class-asset-row';

export interface ClassAssetsTableProps {
    readonly assets: readonly ClassDetailAsset[];
    readonly fieldIds: readonly string[];
    readonly currency: BaseCurrency;
    readonly colorKey: ClassColorKey;
    readonly control: Control<AssetTargetsFormValues>;
}

export function ClassAssetsTable({ assets, fieldIds, currency, colorKey, control }: ClassAssetsTableProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <>
            <div
                className={cn('hidden gap-x-3 border-b border-border pb-2 text-xs font-semibold text-content-muted md:grid', ROW_GRID)}
                aria-hidden="true"
            >
                <span>{t('classDetail.columns.asset')}</span>
                <span className="text-right">{t('classDetail.columns.value')}</span>
                <span className="text-right">{t('classDetail.columns.inClass')}</span>
                <span>{t('classDetail.columns.gauge')}</span>
                <span className="text-right">{t('classDetail.columns.target')}</span>
                <span className="text-right">{t('classDetail.columns.status')}</span>
            </div>
            <ul aria-label={t('classDetail.listLabel')} className="divide-y divide-border">
                {assets.map((asset: ClassDetailAsset, index: number): ReactElement => (
                    <ClassAssetRow
                        key={fieldIds[index] ?? asset.id}
                        index={index}
                        asset={asset}
                        currency={currency}
                        colorKey={colorKey}
                        control={control}
                    />
                ))}
            </ul>
        </>
    );
}
