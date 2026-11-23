import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Alert } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { SkeletonPanel } from '@/shared/ui/skeleton-form';
import { useSupportAccess } from '../api/use-support-access.query';
import type { SupportAccessItem, SupportAccessList } from '../types';
import { AccountSection } from './account-section';

type Translate = UseTranslationResponse<'account', undefined>['t'];

function layerLabel(t: Translate, layer: string): string {
    if (layer === 'summary') {
        return t('supportLayerSummary');
    }
    return layer === 'data' ? t('supportLayerData') : layer;
}

function AccessRow({ item }: { readonly item: SupportAccessItem }): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const locale: SupportedLocale = useLocale();
    const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return (
        <li className="flex flex-col gap-1 border-t border-border py-3 first:border-t-0 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <time dateTime={item.at} className="font-semibold text-content">
                    {formatDate(new Date(item.at), locale, timeZone)}
                </time>
                <span className="text-content-muted">
                    {item.operatorName === null ? t('supportOperatorUnknown') : t('supportOperator', { name: item.operatorName })}
                </span>
                {item.layers.map((layer: string): ReactElement => (
                    <Badge key={layer} tone="neutral">
                        {layerLabel(t, layer)}
                    </Badge>
                ))}
            </div>
            <p className="m-0 text-sm text-content-muted">{t('supportReason', { reason: item.reason })}</p>
        </li>
    );
}

function AccessList({ data }: { readonly data: SupportAccessList }): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    if (data.items.length === 0) {
        return <p className="m-0 text-sm text-content-muted">{t('supportEmpty')}</p>;
    }
    return (
        <ul aria-label={t('supportListLabel')} className="m-0 flex list-none flex-col p-0">
            {data.items.map((item: SupportAccessItem): ReactElement => (
                <AccessRow key={item.id} item={item} />
            ))}
        </ul>
    );
}

export function SupportAccessCard(): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const query: UseQueryResult<SupportAccessList> = useSupportAccess();
    return (
        <AccountSection title={t('supportTitle')} description={t('supportDescription')}>
            {query.isPending ? <SkeletonPanel label={t('supportLoading')} lines={3} /> : null}
            {query.isError ? <Alert title={t('supportFailed')} /> : null}
            {query.isSuccess ? <AccessList data={query.data} /> : null}
        </AccountSection>
    );
}
