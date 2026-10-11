import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { ApiError } from '@/shared/lib/api/api-error';
import { track } from '@/shared/lib/analytics';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import { useAddItems } from '../api/use-add-items.mutation';
import { useSaveCredentials } from '../api/use-save-credentials.mutation';
import type { CredentialsFormInput, CredentialsFormMode } from '../schemas/credentials.schema';
import type { AddItemsBody, AddItemsResponse, ItemResult, SaveCredentialsBody } from '../types';
import { parseItemIds } from './parse-item-ids';

export type FlowPhase = 'idle' | 'testing' | 'connecting';

export type FlowAlert = 'unavailable' | 'disabled' | 'invalid';

export interface CredentialsFlowCallbacks {
    readonly onResults: (results: readonly ItemResult[]) => void;
    readonly onBusyChange: (busy: boolean) => void;
    readonly onSucceeded: () => void;
}

export interface CredentialsFlow {
    readonly phase: FlowPhase;
    readonly alert: FlowAlert | null;
    readonly run: (input: CredentialsFormInput) => Promise<void>;
}

const ALERT_BY_CODE: Readonly<Record<string, FlowAlert>> = {
    'connections.provider_unavailable': 'unavailable',
    'connections.provider_disabled': 'disabled',
    'connections.invalid_credentials': 'invalid'
};

function alertFor(error: Error): FlowAlert | null {
    return error instanceof ApiError ? (ALERT_BY_CODE[error.problem.type] ?? null) : null;
}

function countOutcomes(response: AddItemsResponse): { connected: number; failed: number } {
    const outcomes: string[] = response.results.map((result: ItemResult): string => result.outcome);
    return {
        connected: outcomes.filter((outcome: string): boolean => outcome === 'connected').length,
        failed: outcomes.filter((outcome: string): boolean => outcome !== 'connected' && outcome !== 'already_connected').length
    };
}

interface FlowSteps {
    readonly phase: FlowPhase;
    readonly saveStep: (input: CredentialsFormInput) => Promise<void>;
    readonly addStep: (input: CredentialsFormInput) => Promise<void>;
    readonly idle: () => void;
}

function useFlowSteps(form: UseFormReturn<CredentialsFormInput>, onResults: CredentialsFlowCallbacks['onResults']): FlowSteps {
    const save: UseMutationResult<unknown, ApiError, SaveCredentialsBody> = useSaveCredentials();
    const add: UseMutationResult<AddItemsResponse, ApiError, AddItemsBody> = useAddItems();
    const [phase, setPhase] = useState<FlowPhase>('idle');
    const saveStep = async (input: CredentialsFormInput): Promise<void> => {
        setPhase('testing');
        try {
            await save.mutateAsync({ clientId: input.clientId.trim().toLowerCase(), clientSecret: input.clientSecret });
            track('spending_credentials_saved');
        } finally {
            form.resetField('clientSecret');
            save.reset();
        }
    };
    const addStep = async (input: CredentialsFormInput): Promise<void> => {
        setPhase('connecting');
        const response: AddItemsResponse = await add.mutateAsync({ itemIds: parseItemIds(input.itemIds).valid });
        onResults(response.results);
        track('spending_items_added', countOutcomes(response));
    };
    return {
        phase,
        saveStep,
        addStep,
        idle: (): void => {
            setPhase('idle');
        }
    };
}

interface FlowFailure {
    readonly alert: FlowAlert | null;
    readonly reset: () => void;
    readonly fail: (error: Error) => void;
}

function useFlowFailure(form: UseFormReturn<CredentialsFormInput>, mode: CredentialsFormMode): FlowFailure {
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const toast: ToastApi = useToast();
    const [alert, setAlert] = useState<FlowAlert | null>(null);
    const fail = (error: Error): void => {
        const kind: FlowAlert | null = alertFor(error);
        if (kind === 'invalid' && mode !== 'items') {
            form.setError('clientSecret', { message: t('credentials.errors.invalidCredentials') });
            form.setFocus('clientSecret');
            return;
        }
        if (kind === null) {
            toast.show({ tone: 'critical', title: spendingErrorMessage(ts, error) });
            return;
        }
        setAlert(kind);
    };
    return {
        alert,
        fail,
        reset: (): void => {
            setAlert(null);
        }
    };
}

export function useCredentialsFlow(
    form: UseFormReturn<CredentialsFormInput>,
    mode: CredentialsFormMode,
    callbacks: CredentialsFlowCallbacks
): CredentialsFlow {
    const steps: FlowSteps = useFlowSteps(form, callbacks.onResults);
    const failure: FlowFailure = useFlowFailure(form, mode);
    const run = async (input: CredentialsFormInput): Promise<void> => {
        failure.reset();
        callbacks.onResults([]);
        callbacks.onBusyChange(true);
        try {
            if (mode !== 'items') {
                await steps.saveStep(input);
            }
            if (mode !== 'rotate') {
                await steps.addStep(input);
            }
            callbacks.onSucceeded();
        } catch (error) {
            failure.fail(error as Error);
        } finally {
            steps.idle();
            callbacks.onBusyChange(false);
        }
    };
    return { phase: steps.phase, alert: failure.alert, run };
}
