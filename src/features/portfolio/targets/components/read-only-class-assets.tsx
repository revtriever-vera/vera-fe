import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Card } from '@/shared/ui/card';
import { formatTargetBps } from '../../lib/format-bps';
import type { ClassDetail, ClassDetailAsset } from '../types';

export function ReadOnlyClassAssets({ detail }: { readonly detail: ClassDetail }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const locale: SupportedLocale = useLocale();

    return (
        <Card>
            <ul aria-label={t('classDetail.listLabel')} className="divide-y divide-border">
                {detail.assets.map((asset: ClassDetailAsset): ReactElement => (
                    <li key={`${asset.kind}-${asset.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="min-w-0">
                            <b className="block truncate">{asset.symbol}</b>
                            <span className="block truncate text-xs text-content-muted">{asset.name}</span>
                        </span>
                        <span className="tabular-nums text-content-muted">{formatTargetBps(asset.targetInClassBps, locale)}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
