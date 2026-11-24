import type { ReactElement } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { formatDate } from '@/shared/lib/format/date';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge, type BadgeProps } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ResponsiveRows } from '@/shared/ui/responsive-rows';
import type { TableColumn } from '@/shared/ui/table';
import { TOKEN_STATUS, tokenStatus, type TokenStatus } from '../lib/platform-token-status';
import type { PlatformToken } from '../types';

export interface PlatformTokensTableProps {
    readonly tokens: readonly PlatformToken[];
    readonly onRevoke: (token: PlatformToken) => void;
}

const MIN_WIDTH: string = 'min-w-[56rem]';

const STATUS_TONE: Record<TokenStatus, NonNullable<BadgeProps['tone']>> = {
    active: 'positive',
    expired: 'caution',
    revoked: 'neutral'
};

function StatusBadge({ status }: { readonly status: TokenStatus }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const labels: Record<TokenStatus, string> = {
        active: t('tokenStatusActive'),
        expired: t('tokenStatusExpired'),
        revoked: t('tokenStatusRevoked')
    };
    return <Badge tone={STATUS_TONE[status]}>{labels[status]}</Badge>;
}

function NameCell({ token }: { readonly token: PlatformToken }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <span className="flex flex-col">
            <span>{token.name}</span>
            <span className="font-mono text-xs text-content-muted">{t('tokenHint', { hint: token.hint })}</span>
        </span>
    );
}

interface ColumnContext {
    readonly t: TFunction<'admin'>;
    readonly day: (iso: string) => string;
    readonly now: Date;
    readonly onRevoke: (token: PlatformToken) => void;
}

function RevokeButton({ token, ctx }: { readonly token: PlatformToken; readonly ctx: ColumnContext }): ReactElement | null {
    if (tokenStatus(token, ctx.now) === TOKEN_STATUS.revoked) {
        return null;
    }
    return (
        <Button
            variant="ghost"
            size="sm"
            aria-label={ctx.t('revokeTokenNamed', { name: token.name })}
            onClick={(): void => {
                ctx.onRevoke(token);
            }}
        >
            {ctx.t('revokeToken')}
        </Button>
    );
}

function tokenColumns(ctx: ColumnContext): readonly TableColumn<PlatformToken>[] {
    const { t, day, now }: ColumnContext = ctx;
    return [
        { key: 'name', header: t('tokenColumnName'), render: (token: PlatformToken): ReactElement => <NameCell token={token} /> },
        {
            key: 'creator',
            header: t('tokenColumnCreator'),
            render: (token: PlatformToken): ReactElement => <span className="font-mono text-xs">{token.createdByUserId}</span>
        },
        { key: 'created', header: t('tokenColumnCreated'), render: (token: PlatformToken): string => day(token.createdAt) },
        { key: 'expires', header: t('tokenColumnExpires'), render: (token: PlatformToken): string => day(token.expiresAt) },
        {
            key: 'lastUsed',
            header: t('tokenColumnLastUsed'),
            render: (token: PlatformToken): string => (token.lastUsedAt === null ? t('tokenNeverUsed') : day(token.lastUsedAt))
        },
        {
            key: 'status',
            header: t('tokenColumnStatus'),
            render: (token: PlatformToken): ReactElement => <StatusBadge status={tokenStatus(token, now)} />
        },
        {
            key: 'actions',
            header: t('tokenColumnActions'),
            render: (token: PlatformToken): ReactElement | null => <RevokeButton token={token} ctx={ctx} />
        }
    ];
}

export function PlatformTokensTable({ tokens, onRevoke }: PlatformTokensTableProps): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const locale: SupportedLocale = useLocale();
    const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const day = (iso: string): string => formatDate(new Date(iso), locale, timeZone);
    const columns: readonly TableColumn<PlatformToken>[] = tokenColumns({ t, day, now: new Date(), onRevoke });
    return (
        <ResponsiveRows
            label={t('tokensTableLabel')}
            columns={columns}
            rows={tokens}
            rowKey={(token: PlatformToken): string => token.id}
            minWidthClass={MIN_WIDTH}
        />
    );
}
