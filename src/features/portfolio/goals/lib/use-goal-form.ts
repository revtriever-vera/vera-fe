import { useMemo, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { z } from 'zod';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { localTodayIso } from '../../assets/lib/fixed-income-defaults';
import { usePeople, type PeopleState } from '../../lib/people-context';
import { useCreateGoal } from '../api/use-create-goal.mutation';
import { useUpdateGoal } from '../api/use-update-goal.mutation';
import { createGoalSchema, type GoalFormInput } from '../schemas/goal.schema';
import type { GoalKind, GoalView } from '../types';
import { createBody, emptyFormValues, formValuesOf, updateBody } from './goal-form-values';
import { usedBpsByHolding } from './goal-holdings';
import { goalsErrorMessage } from './goals-error-message';

export interface GoalFormParams {
    readonly goal: GoalView | null;
    readonly kind: GoalKind;
    readonly goals: readonly GoalView[];
    readonly initialName: string;
    readonly onSaved: () => void;
}

export interface GoalFormState {
    readonly form: UseFormReturn<GoalFormInput>;
    readonly today: string;
    readonly usedBps: ReadonlyMap<string, number>;
    readonly busy: boolean;
    readonly alertMessage: string | null;
    readonly submit: () => Promise<void>;
}

interface Submitter {
    readonly run: (values: GoalFormInput) => Promise<void>;
    readonly busy: boolean;
    readonly alertMessage: string | null;
}

function useSubmitter(goal: GoalView | null, onSaved: () => void): Submitter {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const toast: ToastApi = useToast();
    const people: PeopleState = usePeople();
    const create: ReturnType<typeof useCreateGoal> = useCreateGoal();
    const update: ReturnType<typeof useUpdateGoal> = useUpdateGoal();
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const save = async (values: GoalFormInput): Promise<void> => {
        if (goal === null) {
            await create.mutateAsync(createBody(values, people, locale));
            return;
        }
        await update.mutateAsync({ id: goal.id, body: updateBody(goal, values, people, locale) });
    };
    const run = async (values: GoalFormInput): Promise<void> => {
        setAlertMessage(null);
        try {
            await save(values);
            toast.show({ tone: 'positive', title: t(goal === null ? 'form.created' : 'form.saved') });
            onSaved();
        } catch (error) {
            setAlertMessage(goalsErrorMessage(t, error as Error));
        }
    };
    return { run, busy: create.isPending || update.isPending, alertMessage };
}

export function useGoalForm({ goal, kind, goals, initialName, onSaved }: GoalFormParams): GoalFormState {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const locale: SupportedLocale = useLocale();
    const today: string = useMemo((): string => localTodayIso(), []);
    const usedBps: ReadonlyMap<string, number> = useMemo(
        (): ReadonlyMap<string, number> => usedBpsByHolding(goals, goal?.id ?? null),
        [goals, goal]
    );
    const schema: z.ZodType<GoalFormInput> = useMemo(
        (): z.ZodType<GoalFormInput> => createGoalSchema(t, { today, originalDate: goal?.targetDate ?? null, locale, usedBps }),
        [t, today, goal, locale, usedBps]
    );
    const form: UseFormReturn<GoalFormInput> = useForm<GoalFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: goal === null ? emptyFormValues(kind, today, initialName) : formValuesOf(goal, locale)
    });
    const { run, busy, alertMessage }: Submitter = useSubmitter(goal, onSaved);
    const submit: () => Promise<void> = form.handleSubmit(run);
    return { form, today, usedBps, busy, alertMessage, submit };
}
