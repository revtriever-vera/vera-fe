import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import type { z } from 'zod';
import type { CreateRuleBody, RuleResult } from '../../types';
import { useMemo, useState, type ReactElement } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { useUnsavedGuard, type UnsavedGuard } from '@/shared/lib/use-unsaved-guard';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { spendingErrorMessage } from '../../lib/spending-error-message';
import { RULE_PATTERN_MAX_LENGTH, RULE_PATTERN_MIN_LENGTH, type RulePreview, type RulePreviewInput } from '../../types';
import { useCreateRule } from '../api/use-create-rule.mutation';
import { useRulePreview } from '../api/use-rule-preview.query';
import { conflictRuleId, INVALID_RULE_CODE, LIMIT_REACHED_CODE, problemCode } from '../lib/problem';
import { recategorizedToast } from '../lib/recategorized-toast';
import { createRuleSchema, type RuleFormInput } from '../schemas/rule.schema';
import { NewRuleFields } from './new-rule-fields';
import { UnsavedDialog } from './unsaved-dialog';

const FORM_ID: string = 'new-rule-form';
const PREVIEW_DEBOUNCE_MS: number = 400;

export interface NewRuleModalProps {
    readonly onClose: () => void;
    readonly onSeeRule: (id: string) => void;
}

const DEFAULTS: RuleFormInput = { matchType: 'contains', pattern: '', appliesTo: 'out', categoryId: '', applyToPast: true };

function patternIsValid(pattern: string): boolean {
    const length: number = pattern.trim().length;
    return length >= RULE_PATTERN_MIN_LENGTH && length <= RULE_PATTERN_MAX_LENGTH;
}

function usePreviewInput(form: UseFormReturn<RuleFormInput>): RulePreviewInput | null {
    const [matchType, appliesTo, pattern] = useWatch({ control: form.control, name: ['matchType', 'appliesTo', 'pattern'] });
    const settled: string = useDebouncedValue(pattern, PREVIEW_DEBOUNCE_MS);
    if (!patternIsValid(pattern) || !patternIsValid(settled)) {
        return null;
    }
    return { matchType, appliesTo, pattern: settled.trim() };
}

interface Submission {
    readonly submit: (input: RuleFormInput) => void;
    readonly busy: boolean;
    readonly conflictId: string | null;
    readonly limitReached: boolean;
}

function useSubmission(form: UseFormReturn<RuleFormInput>, onClose: () => void): Submission {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const { t: ts }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const create: UseMutationResult<RuleResult, ApiError, CreateRuleBody> = useCreateRule();
    const [conflictId, setConflictId] = useState<string | null>(null);
    const [limitReached, setLimitReached] = useState<boolean>(false);
    const fail = (error: Error): void => {
        setConflictId(conflictRuleId(error));
        setLimitReached(problemCode(error) === LIMIT_REACHED_CODE);
        if (problemCode(error) === INVALID_RULE_CODE) {
            form.setError('pattern', { type: 'server', message: t('newRule.errors.patternInvalid') });
            return;
        }
        if (conflictRuleId(error) === null && problemCode(error) !== LIMIT_REACHED_CODE) {
            toast.show({ tone: 'critical', title: t('toasts.ruleSaveFailed'), detail: spendingErrorMessage(ts, error) });
        }
    };
    const submit = (input: RuleFormInput): void => {
        create.mutate(
            { ...input, pattern: input.pattern.trim() },
            {
                onSuccess: (result): void => {
                    track('spending_rule_created', { matchType: input.matchType });
                    const title: string = input.applyToPast
                        ? recategorizedToast(t, 'ruleCreated', result.recategorized)
                        : t('toasts.ruleCreatedFuture');
                    toast.show({ tone: 'positive', title });
                    onClose();
                },
                onError: fail
            }
        );
    };
    return { submit, busy: create.isPending, conflictId, limitReached };
}

function Conflict({ onSee }: { readonly onSee: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-control bg-caution/10 px-3 py-2 text-sm text-content">
            <span>{t('newRule.conflict.title')}</span>
            <Button type="button" size="sm" variant="secondary" onClick={onSee}>
                {t('newRule.conflict.see')}
            </Button>
        </div>
    );
}

function SubmissionNotices({ state, onSeeRule }: { readonly state: Submission; readonly onSeeRule: (id: string) => void }): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const conflictId: string | null = state.conflictId;
    return (
        <>
            {conflictId === null ? null : (
                <Conflict
                    onSee={(): void => {
                        onSeeRule(conflictId);
                    }}
                />
            )}
            {state.limitReached ? (
                <p role="alert" className="text-sm text-critical">
                    {t('newRule.errors.limitReached')}
                </p>
            ) : null}
        </>
    );
}

interface RuleFormState {
    readonly form: UseFormReturn<RuleFormInput>;
    readonly preview: UseQueryResult<RulePreview>;
    readonly previewActive: boolean;
    readonly patternError: string | undefined;
    readonly guard: UnsavedGuard;
}

function useRuleForm(): RuleFormState {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const schema: z.ZodType<RuleFormInput> = useMemo(() => createRuleSchema(t), [t]);
    const form: UseFormReturn<RuleFormInput> = useForm<RuleFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: DEFAULTS
    });
    const previewInput: RulePreviewInput | null = usePreviewInput(form);
    const preview: UseQueryResult<RulePreview> = useRulePreview(previewInput);
    const guard: UnsavedGuard = useUnsavedGuard(form.formState.isDirty && !form.formState.isSubmitSuccessful);
    const previewInvalid: boolean = preview.error !== null && problemCode(preview.error) === INVALID_RULE_CODE;
    return {
        form,
        preview,
        guard,
        previewActive: previewInput !== null,
        patternError: form.formState.errors.pattern?.message ?? (previewInvalid ? t('newRule.errors.patternInvalid') : undefined)
    };
}

export function NewRuleModal({ onClose, onSeeRule }: NewRuleModalProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    const { form, preview, previewActive, patternError, guard }: RuleFormState = useRuleForm();
    const state: Submission = useSubmission(form, onClose);
    return (
        <Modal
            title={t('newRule.title')}
            onClose={onClose}
            fullOnMobile
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t('newRule.cancel')}
                    </Button>
                    <Button type="submit" form={FORM_ID} loading={state.busy}>
                        {state.busy ? t('newRule.creating') : t('newRule.create')}
                    </Button>
                </>
            }
        >
            <form
                id={FORM_ID}
                noValidate
                onSubmit={(event): void => {
                    void form.handleSubmit(state.submit)(event);
                }}
                className="flex flex-col gap-4"
            >
                <NewRuleFields form={form} preview={preview} previewActive={previewActive} patternError={patternError} />
                <SubmissionNotices state={state} onSeeRule={onSeeRule} />
            </form>
            <UnsavedDialog guard={guard} />
        </Modal>
    );
}
