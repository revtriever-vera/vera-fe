import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { ResponsiveRows } from '@/shared/ui/responsive-rows';
import { SkeletonTable } from '@/shared/ui/skeleton-table';
import type { TableColumn } from '@/shared/ui/table';
import { useSignupLinks } from '../api/use-signup-links.query';
import { platformRefusal } from '../lib/platform-refusal';
import type { SignupLink, SignupLinkList } from '../types';

function useColumns(): readonly TableColumn<SignupLink>[] {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return [
        { key: 'name', header: t('linkColumnName'), render: (link: SignupLink): string => link.label },
        { key: 'redemptions', header: t('funnelRedeemed'), align: 'right', render: (link: SignupLink): number => link.redemptionCount },
        { key: 'trials', header: t('funnelTrials'), align: 'right', render: (link: SignupLink): number => link.trialCount },
        { key: 'subscriptions', header: t('funnelPaid'), align: 'right', render: (link: SignupLink): number => link.subscriptionCount }
    ];
}

function FunnelTable({ links }: { readonly links: readonly SignupLink[] }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const columns: readonly TableColumn<SignupLink>[] = useColumns();
    return <ResponsiveRows label={t('funnelTitle')} columns={columns} rows={links} rowKey={(link: SignupLink): string => link.id} />;
}

export function LinkFunnel(): ReactElement | null {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const links: UseQueryResult<SignupLinkList> = useSignupLinks();
    if (links.isError) {
        return platformRefusal(links.error) === null ? <FailureAlert error={links.error} title={t('funnelLoadError')} /> : null;
    }
    return (
        <section className="flex flex-col gap-2" aria-label={t('funnelTitle')}>
            <h2 className="text-lg font-bold tracking-tight">{t('funnelTitle')}</h2>
            <p className="text-sm text-content-muted">{t('funnelSubtitle')}</p>
            {links.isPending ? (
                <SkeletonTable
                    label={t('funnelTitle')}
                    columns={[t('linkColumnName'), t('funnelRedeemed'), t('funnelTrials'), t('funnelPaid')]}
                    rows={2}
                />
            ) : null}
            {links.data?.items.length === 0 ? <p className="text-sm text-content-muted">{t('funnelEmpty')}</p> : null}
            {links.data !== undefined && links.data.items.length > 0 ? <FunnelTable links={links.data.items} /> : null}
        </section>
    );
}
