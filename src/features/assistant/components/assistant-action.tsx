import { Link } from '@tanstack/react-router';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { Alert } from '@/shared/ui/alert';
import { Button, buttonVariants } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAction } from '../api/use-action.query';
import { useCancelAction, useConfirmAction, type ConfirmActionVariables } from '../api/use-resolve-action.mutations';
import { actionTarget, type ActionTarget } from '../lib/action-targets';
import { assistantErrorMessage } from '../lib/assistant-error-message';
import type { ImportCorrections } from '../lib/assistant-slots';
import { IMPORT_TOOL, type ActionCandidate, type ActionSummary, type ActionView } from '../types';
import { ActionButtons } from './assistant-action-buttons';
import { ActionAlways } from './assistant-action-always';
import { ActionCandidates } from './assistant-action-candidates';
import { ImportOpenBody } from './assistant-import-action';

export interface AssistantActionProps {
    readonly action: ActionSummary;
    readonly onAskAgain: () => void;
}

function Done({ action }: { readonly action: ActionSummary }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const target: ActionTarget | null = actionTarget(action);
    return (
        <div className="flex flex-col items-start gap-2">
            <p className="m-0 font-semibold text-positive">{t('action.done')}</p>
            {action.resultText === null ? null : <p className="m-0">{action.resultText}</p>}
            {target === null ? null : (
                <Link to={target.to} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                    {t(target.labelKey)}
                </Link>
            )}
        </div>
    );
}

function Closed({
    messageKey,
    onAskAgain
}: {
    readonly messageKey: 'action.canceled' | 'action.expired' | 'action.stale';
    readonly onAskAgain: (() => void) | null;
}): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <div className="flex flex-col items-start gap-2">
            <p className="m-0 text-content-muted">{t(messageKey)}</p>
            {onAskAgain === null ? null : (
                <Button variant="secondary" size="sm" onClick={onAskAgain}>
                    {t('action.again')}
                </Button>
            )}
        </div>
    );
}

interface OpenState {
    readonly candidates: readonly ActionCandidate[];
    readonly picked: string | null;
    readonly setPicked: (id: string) => void;
    readonly always: boolean | null;
    readonly setAlways: (always: boolean) => void;
    readonly loading: boolean;
    readonly busy: boolean;
    readonly confirming: boolean;
    readonly confirmed: ActionSummary | null;
    readonly canceled: boolean;
    readonly error: Error | null;
    readonly importPreview: Readonly<Record<string, unknown>> | null;
    readonly confirm: () => void;
    readonly confirmImport: (corrections: ImportCorrections) => void;
    readonly cancel: () => void;
}

function useOpenAction(action: ActionSummary): OpenState {
    const view: UseQueryResult<ActionView> = useAction(action.id, true);
    const confirm: UseMutationResult<ActionSummary, Error, ConfirmActionVariables> = useConfirmAction();
    const cancel: UseMutationResult<ActionSummary, Error, string> = useCancelAction();
    const [picked, setPicked] = useState<string | null>(null);
    const [alwaysChoice, setAlways] = useState<boolean | null>(null);
    const proposedAlways: boolean | null = view.data?.always ?? null;
    const always: boolean | null = proposedAlways === null ? null : (alwaysChoice ?? proposedAlways);
    const candidates: readonly ActionCandidate[] = view.data?.candidates ?? [];
    const version: string | undefined = candidates.find((candidate: ActionCandidate): boolean => candidate.id === picked)?.version;
    return {
        candidates,
        picked,
        setPicked,
        always,
        setAlways,
        loading: view.isPending,
        busy: confirm.isPending || cancel.isPending,
        confirming: confirm.isPending,
        confirmed: confirm.data ?? null,
        canceled: cancel.isSuccess,
        error: confirm.error ?? cancel.error,
        importPreview: view.data?.importPreview ?? null,
        confirm: (): void => {
            confirm.mutate({
                id: action.id,
                choice: { ...(picked === null ? {} : { transactionId: picked, version }), ...(always === null ? {} : { always }) }
            });
        },
        confirmImport: (corrections: ImportCorrections): void => {
            confirm.mutate({ id: action.id, choice: { edits: [...corrections.edits], fixedIncome: [...corrections.fixedIncome] } });
        },
        cancel: (): void => {
            cancel.mutate(action.id);
        }
    };
}

function ChoiceControls({ state }: { readonly state: OpenState }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const { canEdit }: { canEdit: boolean } = useRole();
    const { candidates, picked, busy, loading } = state;
    return (
        <>
            {candidates.length === 0 ? null : (
                <ActionCandidates candidates={candidates} picked={picked} disabled={busy} onPick={state.setPicked} />
            )}
            {state.always === null ? null : <ActionAlways checked={state.always} disabled={busy} onChange={state.setAlways} />}
            {canEdit ? (
                <ActionButtons
                    confirmPending={state.confirming}
                    busy={busy}
                    canConfirm={!loading && (candidates.length === 0 || picked !== null)}
                    onConfirm={state.confirm}
                    onCancel={state.cancel}
                />
            ) : (
                <p className="m-0 text-xs text-content-subtle">{t('action.readOnly')}</p>
            )}
        </>
    );
}

function OpenBody({ action, state }: { readonly action: ActionSummary; readonly state: OpenState }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const isImport: boolean = action.tool === IMPORT_TOOL;
    return (
        <div className="flex flex-col gap-2">
            <p className="m-0">{action.summary}</p>
            {state.loading ? <Skeleton className="h-10 w-full" /> : null}
            {isImport && !state.loading ? <ImportOpenBody state={state} /> : null}
            {isImport ? null : <ChoiceControls state={state} />}
            {state.error === null ? null : <Alert tone="critical" title={assistantErrorMessage(t, state.error, null)} />}
        </div>
    );
}

function Open({ action }: { readonly action: ActionSummary }): ReactElement {
    const state: OpenState = useOpenAction(action);
    if (state.confirmed !== null) {
        return <Done action={state.confirmed} />;
    }
    return state.canceled ? <Closed messageKey="action.canceled" onAskAgain={null} /> : <OpenBody action={action} state={state} />;
}

export function AssistantAction({ action, onAskAgain }: AssistantActionProps): ReactElement {
    if (action.status === 'open') {
        return <Open action={action} />;
    }
    if (action.status === 'confirmed') {
        return <Done action={action} />;
    }
    if (action.status === 'canceled') {
        return <Closed messageKey="action.canceled" onAskAgain={null} />;
    }
    return <Closed messageKey={action.status === 'stale' ? 'action.stale' : 'action.expired'} onAskAgain={onAskAgain} />;
}
