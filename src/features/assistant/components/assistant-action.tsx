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
import type { ActionCandidate, ActionSummary, ActionView } from '../types';
import { ActionCandidates } from './assistant-action-candidates';

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

interface ButtonsProps {
    readonly confirmPending: boolean;
    readonly busy: boolean;
    readonly canConfirm: boolean;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
}

function Buttons({ confirmPending, busy, canConfirm, onConfirm, onCancel }: ButtonsProps): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    return (
        <div className="flex gap-2">
            <Button size="sm" loading={confirmPending} disabled={busy || !canConfirm} onClick={onConfirm}>
                {t('action.confirm')}
            </Button>
            <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
                {t('action.cancel')}
            </Button>
        </div>
    );
}

interface OpenState {
    readonly candidates: readonly ActionCandidate[];
    readonly picked: string | null;
    readonly setPicked: (id: string) => void;
    readonly loading: boolean;
    readonly busy: boolean;
    readonly confirming: boolean;
    readonly confirmed: ActionSummary | null;
    readonly canceled: boolean;
    readonly error: Error | null;
    readonly confirm: () => void;
    readonly cancel: () => void;
}

function useOpenAction(action: ActionSummary): OpenState {
    const view: UseQueryResult<ActionView> = useAction(action.id, true);
    const confirm: UseMutationResult<ActionSummary, Error, ConfirmActionVariables> = useConfirmAction();
    const cancel: UseMutationResult<ActionSummary, Error, string> = useCancelAction();
    const [picked, setPicked] = useState<string | null>(null);
    const candidates: readonly ActionCandidate[] = view.data?.candidates ?? [];
    const version: string | undefined = candidates.find((candidate: ActionCandidate): boolean => candidate.id === picked)?.version;
    return {
        candidates,
        picked,
        setPicked,
        loading: view.isPending,
        busy: confirm.isPending || cancel.isPending,
        confirming: confirm.isPending,
        confirmed: confirm.data ?? null,
        canceled: cancel.isSuccess,
        error: confirm.error ?? cancel.error,
        confirm: (): void => {
            confirm.mutate({ id: action.id, choice: picked === null ? {} : { transactionId: picked, version } });
        },
        cancel: (): void => {
            cancel.mutate(action.id);
        }
    };
}

function OpenBody({ action, state }: { readonly action: ActionSummary; readonly state: OpenState }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const { canEdit }: { canEdit: boolean } = useRole();
    const { candidates, picked, busy, loading, error } = state;
    return (
        <div className="flex flex-col gap-2">
            <p className="m-0">{action.summary}</p>
            {loading ? <Skeleton className="h-10 w-full" /> : null}
            {candidates.length === 0 ? null : (
                <ActionCandidates candidates={candidates} picked={picked} disabled={busy} onPick={state.setPicked} />
            )}
            {error === null ? null : <Alert tone="critical" title={assistantErrorMessage(t, error, null)} />}
            {canEdit ? (
                <Buttons
                    confirmPending={state.confirming}
                    busy={busy}
                    canConfirm={!loading && (candidates.length === 0 || picked !== null)}
                    onConfirm={state.confirm}
                    onCancel={state.cancel}
                />
            ) : (
                <p className="m-0 text-xs text-content-subtle">{t('action.readOnly')}</p>
            )}
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
