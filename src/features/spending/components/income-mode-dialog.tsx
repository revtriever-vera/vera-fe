import { useId, type ReactElement } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { track } from '@/shared/lib/analytics';
import { ApiError } from '@/shared/lib/api/api-error';
import { Button } from '@/shared/ui/button';
import { FailureAlert } from '@/shared/ui/failure-alert';
import { Modal } from '@/shared/ui/modal';
import { SkeletonForm } from '@/shared/ui/skeleton-form';
import { useUpdateSpendingSettings } from '../api/use-spending-settings.mutation';
import { useSpendingSettings } from '../api/use-spending-settings.query';
import { spendingErrorMessage } from '../lib/spending-error-message';
import type { IncomeModeFormInput } from '../schemas/income-mode.schema';
import type { SpendingSettings, UpdateSpendingSettings } from '../types';
import { IncomeModeForm } from './income-mode-form';

export interface IncomeModeDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

const DECLARED_INCOME_CODE: string = 'summary.declared_income_required';

function toSettingsBody(input: IncomeModeFormInput): UpdateSpendingSettings {
    return input.mode === 'declared'
        ? { incomeMode: 'declared', declaredIncomeMinor: input.declaredIncomeMinor }
        : { incomeMode: 'transactions' };
}

type IncomeSubmit = (input: IncomeModeFormInput, form: UseFormReturn<IncomeModeFormInput>) => Promise<void>;

function useIncomeSubmit(onOpenChange: (open: boolean) => void): { readonly submit: IncomeSubmit; readonly pending: boolean } {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const toast: ToastApi = useToast();
    const update: UseMutationResult<SpendingSettings, ApiError, UpdateSpendingSettings> = useUpdateSpendingSettings();
    const submit: IncomeSubmit = async (input, form): Promise<void> => {
        try {
            await update.mutateAsync(toSettingsBody(input));
            track('spending_income_mode_changed', { mode: input.mode });
            toast.show({ tone: 'positive', title: t('income.saved') });
            onOpenChange(false);
        } catch (error) {
            const failure: Error = error instanceof Error ? error : new Error('unknown');
            if (failure instanceof ApiError && failure.problem.type === DECLARED_INCOME_CODE) {
                form.setError('declaredIncomeMinor', { message: spendingErrorMessage(t, failure) });
                return;
            }
            toast.show({ tone: 'critical', title: spendingErrorMessage(t, failure) });
        }
    };
    return { submit, pending: update.isPending };
}

interface BodyProps {
    readonly settings: SpendingSettings;
    readonly onOpenChange: (open: boolean) => void;
}

function IncomeModeBody({ settings, onOpenChange }: BodyProps): ReactElement {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const formId: string = useId();
    const { submit, pending } = useIncomeSubmit(onOpenChange);
    const close = (): void => {
        onOpenChange(false);
    };
    return (
        <Modal
            title={t('income.title')}
            description={t('income.description')}
            onClose={close}
            footer={
                <>
                    <Button variant="secondary" onClick={close}>
                        {t('income.cancel')}
                    </Button>
                    <Button type="submit" form={formId} loading={pending}>
                        {t('income.save')}
                    </Button>
                </>
            }
        >
            <IncomeModeForm
                formId={formId}
                initial={{ mode: settings.incomeMode, declaredIncomeMinor: settings.declaredIncomeMinor }}
                onSubmit={submit}
            />
        </Modal>
    );
}

export function IncomeModeDialog({ open, onOpenChange }: IncomeModeDialogProps): ReactElement | null {
    const { t }: UseTranslationResponse<'spending', undefined> = useTranslation('spending');
    const settings: UseQueryResult<SpendingSettings> = useSpendingSettings();
    if (!open) {
        return null;
    }
    if (settings.data === undefined) {
        return (
            <Modal
                title={t('income.title')}
                onClose={(): void => {
                    onOpenChange(false);
                }}
                footer={null}
            >
                {settings.isError ? (
                    <FailureAlert error={settings.error} title={t('errors.generic')} />
                ) : (
                    <SkeletonForm label={t('income.loading')} fields={1} withAction={false} />
                )}
            </Modal>
        );
    }
    return <IncomeModeBody settings={settings.data} onOpenChange={onOpenChange} />;
}
