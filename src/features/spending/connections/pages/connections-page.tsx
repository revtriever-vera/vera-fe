import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useSession } from '@/app/providers/session-provider';
import { cn } from '@/shared/lib/cn';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Loading, Skeleton } from '@/shared/ui/skeleton';
import { ImportCard } from '../../imports/components/import-card';
import type { ConnectionsResponse } from '../../types';
import { useConnections, type ConnectionsState } from '../api/use-connections.query';
import { ConnectionList } from '../components/connection-list';
import { CredentialsCard, type EditMode } from '../components/credentials-card';
import { PluggyTutorial } from '../components/pluggy-tutorial';

function ConnectionsLoading(): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    return (
        <Loading label={t('page.loading')} className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-96 w-full" />
            <div className="flex flex-col gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        </Loading>
    );
}

function ConnectionsFailure({ error, onRetry }: { readonly error: Error; readonly onRetry: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    return (
        <div className="flex flex-col items-start gap-3">
            <FailureAlert error={error} title={t('page.loadError')} />
            <Button variant="secondary" onClick={onRetry}>
                {t('page.retry')}
            </Button>
        </div>
    );
}

interface ContentProps {
    readonly data: ConnectionsResponse;
    readonly state: ConnectionsState;
    readonly companyId: string;
}

function ConnectionsContent({ data, state, companyId }: ContentProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const configured: boolean = data.credentials.configured;
    const [expanded, setExpanded] = useState<boolean>(!(configured && data.connections.length > 0));
    const [focusStep, setFocusStep] = useState<number | null>(null);
    const [editing, setEditing] = useState<EditMode | null>(null);
    const showStep = (step: number): void => {
        setExpanded(true);
        setFocusStep(step);
    };
    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-content-muted">{t('page.intro')}</p>
            {configured && data.credentials.status === 'invalid' ? (
                <Alert tone="caution" title={t('credentials.configured.invalidTitle')} detail={t('credentials.configured.invalidDetail')} />
            ) : null}
            <div className="grid items-start gap-4 lg:grid-cols-2">
                <div className={cn('min-w-0 lg:order-1', configured ? 'order-2' : 'order-1')}>
                    <PluggyTutorial companyId={companyId} expanded={expanded} focusStep={focusStep} onExpandedChange={setExpanded} />
                </div>
                <div className={cn('flex min-w-0 flex-col gap-4 lg:order-2', configured ? 'order-1' : 'order-2')}>
                    <CredentialsCard credentials={data.credentials} editing={editing} onEditingChange={setEditing} />
                    <ConnectionList
                        connections={data.connections}
                        now={new Date(state.query.dataUpdatedAt)}
                        stalled={state.stalled}
                        onSyncRequested={state.restartPolling}
                        onShowStep={showStep}
                        onRotate={(): void => {
                            setEditing('rotate');
                        }}
                    />
                    <ImportCard />
                </div>
            </div>
        </div>
    );
}

export function ConnectionsPage(): ReactElement {
    const { user } = useSession();
    const state: ConnectionsState = useConnections();
    const { data, error, isPending, refetch } = state.query;
    if (isPending) {
        return <ConnectionsLoading />;
    }
    if (data === undefined) {
        return (
            <ConnectionsFailure
                error={error}
                onRetry={(): void => {
                    void refetch();
                }}
            />
        );
    }
    return <ConnectionsContent data={data} state={state} companyId={user?.companyId ?? ''} />;
}
