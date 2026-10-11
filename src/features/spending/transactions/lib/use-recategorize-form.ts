import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { ApiError } from '@/shared/lib/api/api-error';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import type { RecategorizeBody, RecategorizeResult, TransactionView } from '../../types';
import { useRecategorize, type RecategorizeInput } from '../api/use-recategorize.mutation';
import { recategorizeToast, type RecategorizeOutcome } from './recategorize-toast';
import { descriptionTargetOf, displayDescription, ruleTargetOf, type RuleTarget } from './rule-target';

export type FormProblem = 'kindMismatch' | 'invalidRule' | null;

export interface RecategorizeFormOptions {
    readonly transaction: TransactionView;
    readonly initialAlways: boolean;
    readonly onDone: () => void;
}

export interface RecategorizeForm {
    readonly categoryId: string | null;
    readonly always: boolean;
    readonly target: RuleTarget;
    readonly problem: FormProblem;
    readonly pending: boolean;
    readonly pick: (id: string | null) => void;
    readonly setAlways: (value: boolean) => void;
    readonly submit: () => void;
    readonly revert: () => void;
}

const PROBLEM_BY_TYPE: Readonly<Record<string, Exclude<FormProblem, null>>> = {
    'transactions.category_kind_mismatch': 'kindMismatch',
    'categories.invalid_rule': 'invalidRule'
};

function problemOf(error: Error): FormProblem {
    return error instanceof ApiError ? (PROBLEM_BY_TYPE[error.problem.type] ?? null) : null;
}

interface Sender {
    readonly send: (categoryId: string | null, withRule: boolean) => Promise<void>;
    readonly pending: boolean;
}

interface SenderOptions {
    readonly transaction: TransactionView;
    readonly target: RuleTarget;
    readonly onDone: () => void;
    readonly onProblem: (problem: FormProblem) => void;
}

function useSender({ transaction, target, onDone, onProblem }: SenderOptions): Sender {
    const { t }: UseTranslationResponse<'spendingTransactions', undefined> = useTranslation('spendingTransactions');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const mutation: UseMutationResult<RecategorizeResult, ApiError, RecategorizeInput> = useRecategorize();
    const succeed = (nextCategory: string | null, withRule: boolean, result: RecategorizeResult): void => {
        track('spending_transaction_recategorized', { withRule, scope: withRule ? target.scope : null });
        const outcome: RecategorizeOutcome = {
            reverted: nextCategory === null,
            ruleLabel: withRule ? target.label : null,
            recategorized: result.recategorized
        };
        toast.show({ tone: 'positive', ...recategorizeToast(t, outcome) });
        onDone();
    };
    const fail = (error: Error): void => {
        const found: FormProblem = problemOf(error);
        onProblem(found);
        if (found === null) {
            toast.show({ tone: 'critical', title: spendingErrorMessage(ts, error) });
        }
    };
    return {
        pending: mutation.isPending,
        send: async (nextCategory: string | null, withRule: boolean): Promise<void> => {
            const body: RecategorizeBody = { categoryId: nextCategory, rule: withRule ? { scope: target.scope } : null };
            try {
                succeed(nextCategory, withRule, await mutation.mutateAsync({ id: transaction.id, body }));
            } catch (error) {
                fail(error instanceof Error ? error : new Error(String(error)));
            }
        }
    };
}

export function useRecategorizeForm({ transaction, initialAlways, onDone }: RecategorizeFormOptions): RecategorizeForm {
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [always, setAlways] = useState<boolean>(initialAlways);
    const [problem, setProblem] = useState<FormProblem>(null);
    const target: RuleTarget =
        problem === 'invalidRule' ? descriptionTargetOf(transaction, displayDescription) : ruleTargetOf(transaction, displayDescription);
    const { send, pending }: Sender = useSender({ transaction, target, onDone, onProblem: setProblem });
    return {
        categoryId,
        always,
        target,
        problem,
        pending,
        pick: (id: string | null): void => {
            setCategoryId(id);
            setProblem((current: FormProblem): FormProblem => (current === 'invalidRule' ? current : null));
        },
        setAlways,
        submit: (): void => {
            void send(categoryId, always && categoryId !== null);
        },
        revert: (): void => {
            void send(null, false);
        }
    };
}
