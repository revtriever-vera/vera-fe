import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Money } from '@/shared/ui/money';
import { ClassName } from '../../components/class-name';
import { ClassTile } from '../../components/class-tile';
import { toClassColorKey } from '../../lib/class-color';
import { formatShareBps, formatTargetBps } from '../../lib/format-bps';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { ContributionClass } from '../types';
import { ContributionAssetRow } from './contribution-asset-row';

export interface ContributionClassCardProps {
    readonly item: ContributionClass;
    readonly currency: string;
    readonly portfolioEmpty: boolean;
}

const LINK_CLASS: string = 'text-sm font-semibold text-accent-strong underline-offset-2 hover:underline';

function NoAssets({ item, portfolioEmpty }: { readonly item: ContributionClass; readonly portfolioEmpty: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const label: ClassLabel = useClassLabel();
    if (portfolioEmpty) {
        return (
            <div className="flex flex-col items-start gap-1 pt-3 text-sm text-content-muted">
                <p>{t('emptyPortfolio.message')}</p>
                <Link to="/patrimonio/comecar" className={LINK_CLASS}>
                    {t('emptyPortfolio.link')}
                </Link>
            </div>
        );
    }
    return (
        <div className="flex flex-col items-start gap-1 pt-3 text-sm text-content-muted">
            <p>{t('noAssets.message')}</p>
            <Link to="/patrimonio/classes/$classId" params={{ classId: item.classId }} className={LINK_CLASS}>
                {t('noAssets.link', { name: label(item.systemKey, item.name) })}
            </Link>
        </div>
    );
}

export function ContributionClassCard({ item, currency, portfolioEmpty }: ContributionClassCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioContribution', undefined> = useTranslation('portfolioContribution');
    const locale: SupportedLocale = useLocale();
    const label: ClassLabel = useClassLabel();
    const name: string = label(item.systemKey, item.name);
    return (
        <li className="surface-card flex min-w-0 flex-col p-4">
            <div className="flex flex-col gap-2 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <ClassTile systemKey={item.systemKey} colorKey={toClassColorKey(item.colorKey)} />
                    <div className="flex min-w-0 flex-col">
                        <ClassName systemKey={item.systemKey} name={item.name} className="truncate text-base font-bold text-content" />
                        <span className="numeric text-xs text-content-muted">
                            {t('classShare', {
                                before: formatShareBps(item.shareBeforeBps, locale),
                                after: formatShareBps(item.shareAfterBps, locale),
                                target: formatTargetBps(item.targetBps, locale)
                            })}
                        </span>
                    </div>
                </div>
                <Money amountMinor={item.amountMinor} currency={currency} className="text-lg font-extrabold text-content" />
            </div>
            {item.note === 'no_assets' ? (
                <NoAssets item={item} portfolioEmpty={portfolioEmpty} />
            ) : (
                <ul aria-label={t('assetsLabel', { name })} className="mt-2 divide-y divide-border border-t border-border">
                    {item.assets.map((asset) => (
                        <ContributionAssetRow key={asset.id} asset={asset} currency={currency} />
                    ))}
                </ul>
            )}
        </li>
    );
}
