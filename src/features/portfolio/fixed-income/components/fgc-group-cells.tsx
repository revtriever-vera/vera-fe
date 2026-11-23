import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Money } from '@/shared/ui/money';
import type { FgcGroup } from '../types';

export function GroupNameCell({ group }: { readonly group: FgcGroup }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    const locale: SupportedLocale = useLocale();
    const issuers: string = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format([
        ...new Set(group.titles.map((title: FgcGroup['titles'][number]): string => title.issuerName))
    ]);
    const titles: string = group.titles.map((title: FgcGroup['titles'][number]): string => title.name).join(', ');
    return (
        <span className="flex min-w-0 flex-col">
            <span className="font-semibold">{group.groupName}</span>
            <span className="text-xs text-content-muted">{t('fgc.groupDetail', { issuers, titles })}</span>
        </span>
    );
}

export function OverLimitCell({ group }: { readonly group: FgcGroup }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioFixedIncome', undefined> = useTranslation('portfolioFixedIncome');
    if (group.overMinor <= 0) {
        return <Badge tone="positive">{t('fgc.within')}</Badge>;
    }
    return (
        <Badge tone="critical">
            <Money amountMinor={group.overMinor} currency="BRL" />
        </Badge>
    );
}
