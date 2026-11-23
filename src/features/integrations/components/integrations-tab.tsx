import { useId, useState, type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { Alert } from '@/shared/ui/alert';
import { Card } from '@/shared/ui/card';
import { SkeletonPanel } from '@/shared/ui/skeleton-form';
import { useIntegrations } from '../api/use-integrations.query';
import { integrationErrorMessage } from '../lib/integration-error-message';
import { INTEGRATION_KINDS, type IntegrationItem, type IntegrationKind, type IntegrationsView } from '../types';
import { IntegrationKeyModal } from './integration-key-modal';
import { IntegrationRow } from './integration-row';
import { RemoveIntegrationDialog } from './remove-integration-dialog';

type Pending = { readonly action: 'edit' | 'remove'; readonly kind: IntegrationKind } | null;

function IntegrationsList({ view }: { readonly view: IntegrationsView }): ReactElement {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    const titleId: string = useId();
    const [pending, setPending] = useState<Pending>(null);
    const byKind: ReadonlyMap<IntegrationKind, IntegrationItem> = new Map(view.items.map((item: IntegrationItem) => [item.kind, item]));
    const close = (): void => {
        setPending(null);
    };
    return (
        <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <h2 id={titleId} className="text-base font-semibold text-content">
                    {t('title')}
                </h2>
                <p className="text-sm text-content-muted">{t('description')}</p>
            </div>
            <ul className="flex flex-col">
                {INTEGRATION_KINDS.map((kind: IntegrationKind): ReactElement => (
                    <IntegrationRow
                        key={kind}
                        kind={kind}
                        configured={byKind.get(kind)?.configured === true}
                        needsModel={kind === 'whatsapp' && byKind.get('llm')?.configured !== true}
                        onEdit={(): void => {
                            setPending({ action: 'edit', kind });
                        }}
                        onRemove={(): void => {
                            setPending({ action: 'remove', kind });
                        }}
                    />
                ))}
            </ul>
            {pending?.action === 'edit' ? (
                <IntegrationKeyModal key={pending.kind} kind={pending.kind} item={byKind.get(pending.kind)} view={view} onClose={close} />
            ) : null}
            {pending?.action === 'remove' ? <RemoveIntegrationDialog kind={pending.kind} onClose={close} /> : null}
        </Card>
    );
}

function OwnerOnly(): ReactElement {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    return (
        <Card className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-content">{t('title')}</h2>
            <Alert tone="caution" title={t('ownerOnly')} />
        </Card>
    );
}

export function IntegrationsTab(): ReactElement {
    const { t }: UseTranslationResponse<'integrations', undefined> = useTranslation('integrations');
    const { isOwner } = useRole();
    const integrations: UseQueryResult<IntegrationsView> = useIntegrations(isOwner);
    if (!isOwner) {
        return <OwnerOnly />;
    }
    if (integrations.isPending) {
        return <SkeletonPanel label={t('loading')} lines={4} />;
    }
    if (integrations.error) {
        const error: Error = integrations.error;
        return <Alert title={integrationErrorMessage(t, error, 'llm')} />;
    }
    return <IntegrationsList view={integrations.data} />;
}
