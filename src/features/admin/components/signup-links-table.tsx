import type { ReactElement } from 'react';
import { Copy } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge, type BadgeProps } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Table, type TableColumn } from '@/shared/ui/table';
import { TRIAL_KIND } from '../lib/signup-link-offer';
import type { SignupLink, SignupLinkStatus } from '../types';

export interface SignupLinksTableProps {
    readonly links: readonly SignupLink[];
    readonly onCopy: (link: SignupLink) => void;
    readonly onRevoke: (link: SignupLink) => void;
}

const MIN_WIDTH: string = 'min-w-[60rem]';

const STATUS_TONE: Record<SignupLinkStatus, NonNullable<BadgeProps['tone']>> = {
    active: 'positive',
    revoked: 'neutral',
    expired: 'caution',
    exhausted: 'caution'
};

function StatusBadge({ status }: { readonly status: SignupLinkStatus }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const labels: Record<SignupLinkStatus, string> = {
        active: t('linkStatusActive'),
        revoked: t('linkStatusRevoked'),
        expired: t('linkStatusExpired'),
        exhausted: t('linkStatusExhausted')
    };
    return <Badge tone={STATUS_TONE[status]}>{labels[status]}</Badge>;
}

function OfferSummary({ link }: { readonly link: SignupLink }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const { kind, days }: SignupLink['trial'] = link.trial;
    const trialKey: 'offerTrialCard' | 'offerTrialNoCard' = kind === TRIAL_KIND.card ? 'offerTrialCard' : 'offerTrialNoCard';
    const trial: string = kind === TRIAL_KIND.none ? t('offerNoTrial') : t(trialKey, { count: days ?? 0 });
    const rules: string = link.rules.length === 0 ? t('offerNoRules') : t('offerRules', { count: link.rules.length });
    return (
        <span className="flex flex-col">
            <span>{trial}</span>
            <span className="text-xs text-content-muted">{rules}</span>
        </span>
    );
}

function usesText(t: UseTranslationResponse<'admin', undefined>['t'], link: SignupLink): string {
    return link.maxUses === null
        ? t('usesUnlimited', { used: link.redemptionCount })
        : t('usesOf', { used: link.redemptionCount, max: link.maxUses });
}

function LinkActions({
    link,
    onCopy,
    onRevoke
}: { readonly link: SignupLink } & Pick<SignupLinksTableProps, 'onCopy' | 'onRevoke'>): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <span className="flex gap-2">
            <Button
                variant="secondary"
                size="sm"
                aria-label={t('copyLinkNamed', { name: link.label })}
                onClick={(): void => {
                    onCopy(link);
                }}
            >
                <Copy className="size-3.5" aria-hidden="true" />
                {t('copyLink')}
            </Button>
            {link.status === 'active' ? (
                <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t('revokeLinkNamed', { name: link.label })}
                    onClick={(): void => {
                        onRevoke(link);
                    }}
                >
                    {t('revokeLink')}
                </Button>
            ) : null}
        </span>
    );
}

export function SignupLinksTable({ links, onCopy, onRevoke }: SignupLinksTableProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const locale: SupportedLocale = useLocale();
    const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const columns: readonly TableColumn<SignupLink>[] = [
        { key: 'label', header: t('linkColumnName'), render: (link: SignupLink): string => link.label },
        { key: 'offer', header: t('linkColumnOffer'), render: (link: SignupLink): ReactElement => <OfferSummary link={link} /> },
        { key: 'status', header: t('linkColumnStatus'), render: (link: SignupLink): ReactElement => <StatusBadge status={link.status} /> },
        { key: 'uses', header: t('linkColumnUses'), render: (link: SignupLink): string => usesText(t, link) },
        { key: 'trials', header: t('linkColumnTrials'), render: (link: SignupLink): number => link.trialCount, align: 'right' },
        {
            key: 'subscriptions',
            header: t('linkColumnSubscriptions'),
            render: (link: SignupLink): number => link.subscriptionCount,
            align: 'right'
        },
        {
            key: 'expires',
            header: t('linkColumnExpires'),
            render: (link: SignupLink): string =>
                link.expiresAt === null ? t('neverExpires') : formatDate(new Date(link.expiresAt), locale, timeZone)
        },
        {
            key: 'actions',
            header: t('linkColumnActions'),
            render: (link: SignupLink): ReactElement => <LinkActions link={link} onCopy={onCopy} onRevoke={onRevoke} />
        }
    ];
    return (
        <Table
            label={t('linksTableLabel')}
            columns={columns}
            rows={links}
            rowKey={(link: SignupLink): string => link.id}
            minWidthClass={MIN_WIDTH}
        />
    );
}
