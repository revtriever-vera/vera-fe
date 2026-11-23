import { Calendar, Key, MessageSquare, Phone, type LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { IntegrationKind } from '../types';

const ICONS: Readonly<Record<IntegrationKind, LucideIcon>> = { llm: MessageSquare, whatsapp: Phone, google: Calendar };

export interface IntegrationRowProps {
    readonly kind: IntegrationKind;
    readonly configured: boolean;
    readonly needsModel: boolean;
    readonly onEdit: () => void;
    readonly onRemove: () => void;
}

function RowActions({ kind, configured, onEdit, onRemove }: Omit<IntegrationRowProps, 'needsModel'>): ReactElement {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    const name: string = t(`kinds.${kind}.title`);
    if (!configured) {
        return (
            <Button type="button" size="sm" onClick={onEdit} aria-label={t('registerAria', { name })}>
                <Key className="size-4" aria-hidden="true" />
                {t('register')}
            </Button>
        );
    }
    return (
        <>
            <Button type="button" size="sm" variant="ghost" onClick={onEdit} aria-label={t('replaceAria', { name })}>
                {t('replace')}
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={onRemove} aria-label={t('removeAria', { name })}>
                {t('remove')}
            </Button>
        </>
    );
}

export function IntegrationRow({ kind, configured, needsModel, onEdit, onRemove }: IntegrationRowProps): ReactElement {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    const Icon: LucideIcon = ICONS[kind];
    return (
        <li className="flex flex-wrap items-center gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-muted text-content-muted">
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-content">
                    {t(`kinds.${kind}.title`)}
                    <Badge tone={configured ? 'positive' : 'neutral'}>{t(configured ? 'configured' : 'notConfigured')}</Badge>
                </span>
                <span className="text-sm text-content-muted">{t(`kinds.${kind}.description`)}</span>
                {needsModel ? <span className="text-sm font-medium text-caution">{t('needsModel')}</span> : null}
            </div>
            <div className="flex items-center gap-2">
                <RowActions kind={kind} configured={configured} onEdit={onEdit} onRemove={onRemove} />
            </div>
        </li>
    );
}
