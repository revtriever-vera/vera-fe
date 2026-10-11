import { useId, useState, type ReactElement } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import type { ConnectionView } from '../../types';
import { useConnectionSync, type ConnectionSync } from '../lib/use-connection-sync';
import { ConnectionRow } from './connection-row';
import { RemoveConnectionDialog } from './remove-connection-dialog';

export interface ConnectionListProps {
    readonly connections: readonly ConnectionView[];
    readonly now: Date;
    readonly stalled: boolean;
    readonly onSyncRequested: () => void;
    readonly onShowStep: (step: number) => void;
    readonly onRotate: () => void;
}

function ListHeader({
    sync,
    hasConnections,
    allSyncing,
    titleId
}: {
    readonly sync: ConnectionSync;
    readonly hasConnections: boolean;
    readonly allSyncing: boolean;
    readonly titleId: string;
}): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
                <h2 id={titleId} className="text-base font-semibold text-content">
                    {t('banks.title')}
                </h2>
                <p className="text-sm text-content-muted">{t('banks.intro')}</p>
            </div>
            {hasConnections ? (
                <Button variant="secondary" size="sm" loading={sync.allPending} disabled={allSyncing} onClick={sync.syncAll}>
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    {t('banks.syncAll')}
                </Button>
            ) : null}
        </div>
    );
}

interface ListBodyProps {
    readonly connections: readonly ConnectionView[];
    readonly now: Date;
    readonly sync: ConnectionSync;
    readonly onRemove: (connection: ConnectionView) => void;
    readonly onShowStep: (step: number) => void;
    readonly onRotate: () => void;
}

function ListBody({ connections, now, sync, onRemove, onShowStep, onRotate }: ListBodyProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    if (connections.length === 0) {
        return <EmptyState title={t('banks.empty')} description={t('banks.emptyHint')} />;
    }
    return (
        <ul className="flex flex-col gap-3">
            {connections.map((connection: ConnectionView): ReactElement => (
                <ConnectionRow
                    key={connection.id}
                    connection={connection}
                    now={now}
                    syncPending={sync.onePending}
                    onSync={sync.syncOne}
                    onRemove={onRemove}
                    onShowStep={onShowStep}
                    onRotate={onRotate}
                />
            ))}
        </ul>
    );
}

export function ConnectionList({ connections, now, stalled, onSyncRequested, onShowStep, onRotate }: ConnectionListProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const titleId: string = useId();
    const sync: ConnectionSync = useConnectionSync(onSyncRequested);
    const [removing, setRemoving] = useState<ConnectionView | null>(null);
    const allSyncing: boolean = connections.every((connection: ConnectionView): boolean => connection.syncing);
    return (
        <Card className="flex flex-col gap-3" role="region" aria-labelledby={titleId}>
            <ListHeader sync={sync} hasConnections={connections.length > 0} allSyncing={allSyncing} titleId={titleId} />
            <ListBody connections={connections} now={now} sync={sync} onRemove={setRemoving} onShowStep={onShowStep} onRotate={onRotate} />
            {stalled ? (
                <p role="status" className="text-sm text-content-muted">
                    {t('banks.stalled')}
                </p>
            ) : null}
            {removing === null ? null : (
                <RemoveConnectionDialog
                    connection={removing}
                    onClose={(): void => {
                        setRemoving(null);
                    }}
                />
            )}
        </Card>
    );
}
