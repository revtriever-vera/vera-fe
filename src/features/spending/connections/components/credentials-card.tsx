import { useId, useState, type ReactElement } from 'react';
import { Landmark } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import type { CredentialsView } from '../../types';
import type { CredentialsFormMode } from '../schemas/credentials.schema';
import type { ItemResult } from '../types';
import { ConfiguredCredentials, type ConfiguredAction } from './configured-credentials';
import { CredentialsForm } from './credentials-form';
import { ItemResults } from './item-results';
import { TrustNotes } from './trust-notes';
import { RemoveCredentialsDialog } from './remove-credentials-dialog';

export type EditMode = Exclude<CredentialsFormMode, 'full'>;

const INTRO_KEYS: Readonly<Record<CredentialsFormMode, 'credentials.formIntro' | 'credentials.rotateIntro' | 'credentials.addIntro'>> = {
    full: 'credentials.formIntro',
    rotate: 'credentials.rotateIntro',
    items: 'credentials.addIntro'
};

export interface CredentialsCardProps {
    readonly credentials: CredentialsView;
    readonly editing: EditMode | null;
    readonly onEditingChange: (mode: EditMode | null) => void;
}

interface EditAreaProps {
    readonly mode: CredentialsFormMode;
    readonly onCancel: (() => void) | null;
    readonly onResults: (results: readonly ItemResult[]) => void;
    readonly onBusyChange: (busy: boolean) => void;
    readonly onSucceeded: () => void;
}

function EditArea({ mode, ...rest }: EditAreaProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-content-muted">{t(INTRO_KEYS[mode])}</p>
            <CredentialsForm key={mode} mode={mode} {...rest} />
        </div>
    );
}

interface CardState {
    readonly mode: CredentialsFormMode | null;
    readonly fullFlow: boolean;
    readonly removing: boolean;
    readonly results: readonly ItemResult[];
    readonly setResults: (results: readonly ItemResult[]) => void;
    readonly setFullFlow: (busy: boolean) => void;
    readonly setRemoving: (removing: boolean) => void;
    readonly onAction: (action: ConfiguredAction) => void;
}

function useCardState(credentials: CredentialsView, editing: EditMode | null, onEditingChange: (mode: EditMode | null) => void): CardState {
    const [removing, setRemoving] = useState<boolean>(false);
    const [results, setResults] = useState<readonly ItemResult[]>([]);
    const [fullFlow, setFullFlow] = useState<boolean>(false);
    const onAction = (action: ConfiguredAction): void => {
        if (action === 'remove') {
            setRemoving(true);
            return;
        }
        setResults([]);
        onEditingChange(action);
    };
    const mode: CredentialsFormMode | null = !credentials.configured || fullFlow ? 'full' : editing;
    return { mode, fullFlow, removing, results, setResults, setFullFlow, setRemoving, onAction };
}

function EditSection({
    state,
    onEditingChange
}: {
    readonly state: CardState;
    readonly onEditingChange: (mode: EditMode | null) => void;
}): ReactElement | null {
    const { mode } = state;
    if (mode === null) {
        return null;
    }
    return (
        <EditArea
            mode={mode}
            onCancel={
                mode === 'full'
                    ? null
                    : (): void => {
                          onEditingChange(null);
                      }
            }
            onResults={state.setResults}
            onBusyChange={(busy: boolean): void => {
                if (mode === 'full') {
                    state.setFullFlow(busy);
                }
            }}
            onSucceeded={(): void => {
                onEditingChange(null);
            }}
        />
    );
}

export function CredentialsCard({ credentials, editing, onEditingChange }: CredentialsCardProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const titleId: string = useId();
    const state: CardState = useCardState(credentials, editing, onEditingChange);
    return (
        <Card className="flex flex-col gap-4" role="region" aria-labelledby={titleId}>
            <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold text-content">
                <Landmark className="size-4 text-accent-strong" aria-hidden="true" />
                {t('credentials.title')}
            </h2>
            {credentials.configured && !state.fullFlow ? (
                <ConfiguredCredentials credentials={credentials} disabled={editing !== null} onAction={state.onAction} />
            ) : null}
            <EditSection state={state} onEditingChange={onEditingChange} />
            <ItemResults results={state.results} />
            <TrustNotes />
            {state.removing ? (
                <RemoveCredentialsDialog
                    onClose={(): void => {
                        state.setRemoving(false);
                    }}
                />
            ) : null}
        </Card>
    );
}
