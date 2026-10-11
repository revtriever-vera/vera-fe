import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { BaseCurrencySwitch } from '../../components/base-currency-switch';
import { ClassName } from '../../components/class-name';
import { ClassTile } from '../../components/class-tile';
import { toClassColorKey } from '../../lib/class-color';
import { formatShareBps, formatTargetBps } from '../../lib/format-bps';
import type { ClassDetail } from '../types';

export interface ClassHeaderProps {
    readonly detail: ClassDetail;
}

export function ClassHeader({ detail }: ClassHeaderProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();
    const { class: assetClass } = detail;
    return (
        <header className="flex flex-col gap-3">
            <Link
                to="/portfolio"
                activeOptions={{ exact: true }}
                className="inline-flex items-center gap-1 self-start text-sm font-semibold text-accent-strong underline-offset-2 hover:underline"
            >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {t('classDetail.back')}
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <ClassTile systemKey={assetClass.systemKey} colorKey={toClassColorKey(assetClass.colorKey)} />
                    <div className="min-w-0">
                        <h2 className="truncate text-xl font-extrabold">
                            <ClassName systemKey={assetClass.systemKey} name={assetClass.name} />
                        </h2>
                        <p className="text-sm text-content-muted">
                            {t('classDetail.subtitle', {
                                value: formatCurrency(assetClass.valueMinor, detail.baseCurrency, locale),
                                share: formatShareBps(assetClass.shareBps, locale),
                                target: formatTargetBps(assetClass.targetBps, locale)
                            })}
                        </p>
                    </div>
                </div>
                <BaseCurrencySwitch />
            </div>
        </header>
    );
}
